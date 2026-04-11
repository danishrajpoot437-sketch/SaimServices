import { Router, type Request, type Response } from "express";

const router = Router();

const SS_BASE = "https://api.semanticscholar.org/graph/v1/paper/search";
const FIELDS = "paperId,title,abstract,year,authors,venue,externalIds,openAccessPdf,fieldsOfStudy";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry { data: unknown; expires: number }
const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.data;
}

function setCached(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  // Prevent unbounded growth — evict oldest if over 200 entries
  if (cache.size > 200) cache.delete(cache.keys().next().value!);
}

const VALID_SORTS = new Set(["relevance", "citationCount", "year"]);
const VALID_SUBJECTS = new Set(["all", "cs", "physics", "math", "biology", "medicine", "chemistry", "engineering"]);

router.get("/papers/search", async (req: Request, res: Response) => {
  const rawQuery  = String(req.query.query  ?? "").trim();
  const subject   = String(req.query.subject ?? "all");
  const sort      = String(req.query.sort    ?? "relevance");
  const offset    = Math.max(0, parseInt(String(req.query.offset ?? "0"), 10) || 0);
  const limit     = Math.min(10, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));

  if (!rawQuery) return res.status(400).json({ error: "query is required" });
  if (!VALID_SORTS.has(sort))    return res.status(400).json({ error: "invalid sort" });
  if (!VALID_SUBJECTS.has(subject)) return res.status(400).json({ error: "invalid subject" });

  const fullQuery = subject !== "all" ? `${rawQuery} ${subject}` : rawQuery;

  const cacheKey = `${fullQuery}|${sort}|${offset}|${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  const params = new URLSearchParams({ query: fullQuery, fields: FIELDS, limit: String(limit), offset: String(offset) });
  if (sort === "citationCount" || sort === "year") params.set("sort", sort);

  const upstreamUrl = `${SS_BASE}?${params.toString()}`;

  type FetchResponse = Awaited<ReturnType<typeof fetch>>;

  const doFetch = async (): Promise<FetchResponse> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const r = await fetch(upstreamUrl, {
        headers: { "User-Agent": "SaimServices/1.0", "Accept": "application/json" },
        signal: controller.signal,
      });
      return r;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    let upstreamRes = await doFetch();

    // Retry once after 2 s if rate-limited
    if (upstreamRes.status === 429) {
      await new Promise(r => setTimeout(r, 2_000));
      upstreamRes = await doFetch();
    }

    if (!upstreamRes.ok) {
      if (upstreamRes.status === 429) {
        return res.status(429).json({ error: "Rate limit — please wait a moment and try again." });
      }
      return res.status(502).json({ error: `Upstream error: ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    setCached(cacheKey, data);
    return res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: `Failed to reach Semantic Scholar: ${msg}` });
  }
});

export default router;
