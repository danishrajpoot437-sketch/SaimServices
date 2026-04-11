import { Router, type Request, type Response } from "express";

const router = Router();

// ─── OpenAlex API (no rate-limit issues, 200 M+ papers, free) ─────────────────
const OA_BASE = "https://api.openalex.org/works";
const MAILTO  = "contact@saimservices.com"; // polite-pool → higher limits
const SELECT  = [
  "id", "doi", "ids", "display_name", "publication_year",
  "authorships", "primary_location", "open_access", "topics",
  "best_oa_location", "abstract_inverted_index",
].join(",");

const CACHE_TTL_MS = 5 * 60 * 1_000;
interface CacheEntry { data: unknown; expires: number }
const cache = new Map<string, CacheEntry>();
function getCached(key: string): unknown | null {
  const e = cache.get(key);
  if (!e || Date.now() > e.expires) { cache.delete(key); return null; }
  return e.data;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > 200) cache.delete(cache.keys().next().value!);
}

// ─── OpenAlex types ────────────────────────────────────────────────────────────
interface OAAuthor       { display_name: string }
interface OAAuthorship   { author: OAAuthor }
interface OASource       { display_name: string }
interface OALocation     { source: OASource | null; pdf_url: string | null; is_oa?: boolean }
interface OAOAInfo        { is_oa: boolean; oa_url: string | null }
interface OATopic        { display_name: string }
interface OABestOA       { pdf_url: string | null; landing_page_url: string | null }
interface OAIDs          { pmid?: string; arxiv?: string }

interface OAWork {
  id: string;
  doi: string | null;
  ids: OAIDs | null;
  display_name: string;
  publication_year: number | null;
  authorships: OAAuthorship[] | null;
  primary_location: OALocation | null;
  open_access: OAOAInfo | null;
  topics: OATopic[] | null;
  best_oa_location: OABestOA | null;
  abstract_inverted_index: Record<string, number[]> | null;
}

interface OAResponse { results: OAWork[]; meta: { count: number; page: number; per_page: number } }

// ─── Helpers ───────────────────────────────────────────────────────────────────
function reconstructAbstract(idx: Record<string, number[]> | null): string {
  if (!idx) return "";
  const slots: string[] = [];
  for (const [word, positions] of Object.entries(idx)) {
    for (const p of positions) slots[p] = word;
  }
  return slots.filter(Boolean).join(" ").slice(0, 1_500);
}

function transformWork(w: OAWork) {
  const rawArxiv = w.ids?.arxiv ?? null;
  const arxivId  = rawArxiv ? rawArxiv.replace("https://arxiv.org/abs/", "") : null;
  const rawPmid  = w.ids?.pmid ?? null;
  const pmid     = rawPmid ? rawPmid.replace("https://pubmed.ncbi.nlm.nih.gov/", "").replace(/\/$/, "") : null;
  const doi      = w.doi ? w.doi.replace("https://doi.org/", "") : null;

  const pdfUrl =
    w.best_oa_location?.pdf_url ??
    (w.open_access?.oa_url?.endsWith(".pdf") ? w.open_access.oa_url : null) ??
    null;

  return {
    paperId: w.id,
    title:   w.display_name ?? "",
    abstract: reconstructAbstract(w.abstract_inverted_index),
    year:   w.publication_year,
    authors: (w.authorships ?? []).map(a => ({ name: a.author.display_name })),
    venue:  w.primary_location?.source?.display_name ?? "",
    externalIds: {
      ...(arxivId ? { ArXiv: arxivId } : {}),
      ...(pmid    ? { PubMed: pmid }   : {}),
      ...(doi     ? { DOI: doi }       : {}),
    },
    openAccessPdf: pdfUrl ? { url: pdfUrl, status: "GREEN" } : null,
    fieldsOfStudy: (w.topics ?? []).slice(0, 4).map(t => t.display_name),
  };
}

// ─── Route ─────────────────────────────────────────────────────────────────────
const VALID_SORTS    = new Set(["relevance", "citationCount", "year"]);
const VALID_SUBJECTS = new Set(["all", "cs", "physics", "math", "biology", "medicine", "chemistry", "engineering"]);

router.get("/papers/search", async (req: Request, res: Response) => {
  const rawQuery = String(req.query.query  ?? "").trim();
  const subject  = String(req.query.subject ?? "all");
  const sort     = String(req.query.sort    ?? "relevance");
  const offset   = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);
  const limit    = Math.min(10, Math.max(1, parseInt(String(req.query.limit  ?? "10"), 10) || 10));

  if (!rawQuery)                    return res.status(400).json({ error: "query is required" });
  if (!VALID_SORTS.has(sort))       return res.status(400).json({ error: "invalid sort" });
  if (!VALID_SUBJECTS.has(subject)) return res.status(400).json({ error: "invalid subject" });

  const fullQuery = subject !== "all" ? `${rawQuery} ${subject}` : rawQuery;
  const page      = Math.floor(offset / 10) + 1;

  const sortParam: Record<string, string> = {
    relevance:     "relevance_score:desc",
    citationCount: "cited_by_count:desc",
    year:          "publication_year:desc",
  };

  const cacheKey = `${fullQuery}|${sort}|${page}|${limit}`;
  const cached   = getCached(cacheKey);
  if (cached) return res.json(cached);

  const params = new URLSearchParams({
    search:   fullQuery,
    per_page: String(limit),
    page:     String(page),
    select:   SELECT,
    mailto:   MAILTO,
    sort:     sortParam[sort],
  });

  const upstreamUrl = `${OA_BASE}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);

    const oaRes = await fetch(upstreamUrl, {
      headers: { "User-Agent": "SaimServices/1.0", Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!oaRes.ok) {
      return res.status(502).json({ error: `Upstream error: ${oaRes.status}` });
    }

    const oaData = (await oaRes.json()) as OAResponse;
    const result = {
      total: oaData.meta.count,
      data:  (oaData.results ?? []).map(transformWork),
    };

    setCached(cacheKey, result);
    return res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: `Failed to reach OpenAlex: ${msg}` });
  }
});

export default router;
