import { Router, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SaimAdmin2025";
const validTokens   = new Map<string, number>(); // token → expiry timestamp

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  const token   = randomUUID();
  const expires = Date.now() + TOKEN_TTL_MS;
  validTokens.set(token, expires);
  res.json({ token, expiresAt: new Date(expires).toISOString() });
});

router.post("/admin/logout", (req: Request, res: Response) => {
  const auth  = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  validTokens.delete(token);
  res.json({ ok: true });
});

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth  = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const exp   = validTokens.get(token);
  if (!exp || Date.now() > exp) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  validTokens.set(token, Date.now() + TOKEN_TTL_MS);
  next();
}

export default router;
