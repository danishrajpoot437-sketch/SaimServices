import { Router, type Request, type Response } from "express";
import { db, blogsTable } from "@workspace/db";
import { eq, desc, and, or, lte } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function calcReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* ── Public: list published blogs ────────────────────────────────────────── */
router.get("/blogs", async (req, res) => {
  try {
    const now  = new Date();
    const rows = await db
      .select()
      .from(blogsTable)
      .where(
        or(
          eq(blogsTable.status, "published"),
          and(eq(blogsTable.status, "scheduled"), lte(blogsTable.scheduledAt, now))
        )
      )
      .orderBy(desc(blogsTable.publishedAt), desc(blogsTable.createdAt));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

/* ── Public: single blog by slug ─────────────────────────────────────────── */
router.get("/blogs/:slug", async (req, res) => {
  try {
    const now  = new Date();
    const rows = await db
      .select()
      .from(blogsTable)
      .where(eq(blogsTable.slug, req.params.slug));
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const blog = rows[0];
    const isVisible =
      blog.status === "published" ||
      (blog.status === "scheduled" && blog.scheduledAt && blog.scheduledAt <= now);
    if (!isVisible) { res.status(404).json({ error: "Not found" }); return; }
    res.json(blog);
  } catch {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

/* ── Admin: list ALL blogs (including drafts) ────────────────────────────── */
router.get("/admin/blogs", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

/* ── Admin: create blog ──────────────────────────────────────────────────── */
router.post("/admin/blogs", requireAdmin, async (req, res) => {
  try {
    const body = req.body as {
      title: string; excerpt: string; content: string;
      category?: string; tags?: string; coverImage?: string;
      author?: string; status?: string; scheduledAt?: string;
    };
    if (!body.title || !body.excerpt || !body.content) {
      res.status(400).json({ error: "title, excerpt, content required" }); return;
    }
    const slug      = slugify(body.title) + "-" + Date.now().toString(36);
    const readTime  = calcReadTime(body.content);
    const publishedAt = body.status === "published" ? new Date() : null;
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    const [row] = await db.insert(blogsTable).values({
      title:       body.title,
      slug,
      excerpt:     body.excerpt,
      content:     body.content,
      category:    body.category ?? "general",
      tags:        body.tags ?? "",
      coverImage:  body.coverImage ?? null,
      author:      body.author ?? "Saim",
      status:      body.status ?? "draft",
      readTime,
      publishedAt,
      scheduledAt,
    }).returning();
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ── Admin: update blog ──────────────────────────────────────────────────── */
router.put("/admin/blogs/:id", requireAdmin, async (req, res) => {
  try {
    const id   = parseInt(req.params.id);
    const body = req.body as Partial<{
      title: string; excerpt: string; content: string; category: string;
      tags: string; coverImage: string; author: string;
      status: string; scheduledAt: string;
    }>;

    const existing = await db.select().from(blogsTable).where(eq(blogsTable.id, id));
    if (!existing.length) { res.status(404).json({ error: "Not found" }); return; }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title)      { updates.title = body.title; }
    if (body.excerpt)    { updates.excerpt = body.excerpt; }
    if (body.content)    { updates.content = body.content; updates.readTime = calcReadTime(body.content); }
    if (body.category)   { updates.category = body.category; }
    if ("tags" in body)  { updates.tags = body.tags; }
    if ("coverImage" in body) { updates.coverImage = body.coverImage; }
    if (body.author)     { updates.author = body.author; }
    if (body.status) {
      updates.status = body.status;
      if (body.status === "published" && existing[0].status !== "published") {
        updates.publishedAt = new Date();
      }
    }
    if ("scheduledAt" in body) {
      updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await db.update(blogsTable).set(updates as any).where(eq(blogsTable.id, id)).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ── Admin: delete blog ──────────────────────────────────────────────────── */
router.delete("/admin/blogs/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(blogsTable).where(eq(blogsTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
