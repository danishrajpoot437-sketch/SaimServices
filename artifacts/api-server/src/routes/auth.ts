import { Router, type Request, type Response } from "express";
import { createHash, randomInt } from "crypto";
import { User } from "../models/User";
import { sendOtpEmail } from "../lib/mailer";

const router = Router();

const OTP_TTL_MS = 10 * 60 * 1000;
const EMAIL_ENABLED = !!(process.env["EMAIL_USER"] && process.env["EMAIL_PASS"]);

function hashPassword(password: string, email: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${password}:saimservices2025`)
    .digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

function userPayload(user: InstanceType<typeof User>) {
  return {
    id: (user._id as object).toString(),
    name: user.name,
    email: user.email,
    createdAt: (user.createdAt as Date).getTime(),
  };
}

router.post("/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string; email?: string; password?: string;
  };

  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters." }); return;
  }
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." }); return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." }); return;
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const existing = await User.findOne({ email: normalEmail });

    if (existing) {
      if (existing.isVerified) {
        res.status(409).json({ error: "An account with this email already exists." }); return;
      }
      const otp = generateOtp();
      existing.otp = otp;
      existing.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      existing.name = name.trim();
      existing.passwordHash = hashPassword(password, normalEmail);

      if (!EMAIL_ENABLED) {
        existing.isVerified = true;
        existing.otp = null;
        existing.otpExpiry = null;
        await existing.save();
        res.json({ message: "Account activated.", user: userPayload(existing), skipOtp: true });
        return;
      }

      await existing.save();
      sendOtpEmail(normalEmail, name.trim(), otp).catch((err) => {
        console.error("OTP email failed:", err?.message ?? err);
        console.info(`[DEV] OTP for ${normalEmail}: ${otp}`);
      });
      res.json({ message: "OTP resent. Please check your email.", email: normalEmail });
      return;
    }

    const otp = generateOtp();

    if (!EMAIL_ENABLED) {
      const user = new User({
        name: name.trim(), email: normalEmail,
        passwordHash: hashPassword(password, normalEmail),
        isVerified: true, otp: null, otpExpiry: null,
      });
      await user.save();
      res.status(201).json({ message: "Account created and activated!", user: userPayload(user), skipOtp: true });
      return;
    }

    const user = new User({
      name: name.trim(), email: normalEmail,
      passwordHash: hashPassword(password, normalEmail),
      isVerified: false, otp, otpExpiry: new Date(Date.now() + OTP_TTL_MS),
    });
    await user.save();

    sendOtpEmail(normalEmail, name.trim(), otp).catch((err) => {
      console.error("OTP email failed:", err?.message ?? err);
      console.info(`[DEV] OTP for ${normalEmail}: ${otp}`);
    });

    res.status(201).json({
      message: "Account created. Please check your email for the verification code.",
      email: normalEmail,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

async function googleUserFromAccessToken(accessToken: string): Promise<{ email: string; name: string; sub: string }> {
  const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error("Failed to verify Google token.");
  const info = await r.json() as { email?: string; name?: string; sub?: string };
  if (!info.email) throw new Error("Google did not return an email address.");
  return { email: info.email, name: info.name ?? info.email.split("@")[0], sub: info.sub ?? "" };
}

router.post("/auth/google-token", async (req: Request, res: Response) => {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken) {
    res.status(400).json({ error: "Access token is required." }); return;
  }
  try {
    const { email, name, sub } = await googleUserFromAccessToken(accessToken);
    const normalEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalEmail });
    if (!user) {
      user = new User({ name, email: normalEmail, passwordHash: "", isVerified: true, otp: null, otpExpiry: null, googleId: sub });
      await user.save();
    } else if (!user.isVerified) {
      user.isVerified = true; user.googleId = sub;
      await user.save();
    }
    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error("Google token auth error:", err);
    res.status(401).json({ error: "Google sign-in failed. Please try again." });
  }
});

router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required." }); return;
  }
  const normalEmail = email.toLowerCase().trim();
  try {
    const user = await User.findOne({ email: normalEmail });
    if (!user) { res.status(404).json({ error: "No account found for this email." }); return; }
    if (user.isVerified) { res.status(400).json({ error: "This account is already verified. Please sign in." }); return; }
    if (!user.otp || !user.otpExpiry) { res.status(400).json({ error: "No verification code found. Please request a new one." }); return; }
    if (new Date() > user.otpExpiry) { res.status(400).json({ error: "Your verification code has expired. Please request a new one." }); return; }
    if (user.otp !== otp.trim()) { res.status(400).json({ error: "Incorrect verification code. Please try again." }); return; }
    user.isVerified = true; user.otp = null; user.otpExpiry = null;
    await user.save();
    res.json({ message: "Email verified successfully!", user: userPayload(user) });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." }); return;
  }
  const normalEmail = email.toLowerCase().trim();
  try {
    const user = await User.findOne({ email: normalEmail });
    if (!user) { res.status(401).json({ error: "No account found with this email address." }); return; }
    if (!user.passwordHash) { res.status(401).json({ error: "This account uses Google sign-in. Please sign in with Google." }); return; }
    if (!user.isVerified) {
      res.status(403).json({
        error: "Your email is not verified yet. Please check your inbox.",
        requiresVerification: true, email: normalEmail,
      }); return;
    }
    if (user.passwordHash !== hashPassword(password, normalEmail)) {
      res.status(401).json({ error: "Incorrect password. Please try again." }); return;
    }
    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/resend-otp", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "Email is required." }); return; }
  const normalEmail = email.toLowerCase().trim();
  try {
    const user = await User.findOne({ email: normalEmail });
    if (!user) { res.status(404).json({ error: "No account found for this email." }); return; }
    if (user.isVerified) { res.status(400).json({ error: "This account is already verified. Please sign in." }); return; }
    const otp = generateOtp();
    user.otp = otp; user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    sendOtpEmail(normalEmail, user.name, otp).catch((err) => {
      console.error("Resend OTP email failed:", err?.message ?? err);
      console.info(`[DEV] Resend OTP for ${normalEmail}: ${otp}`);
    });
    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
