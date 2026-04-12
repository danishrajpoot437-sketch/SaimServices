import { Router, type Request, type Response } from "express";
import { createHash, randomInt } from "crypto";
import { User } from "../models/User";
import { sendOtpEmail } from "../lib/mailer";

const router = Router();

const OTP_TTL_MS = 10 * 60 * 1000;

function hashPassword(password: string, email: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${password}:saimservices2025`)
    .digest("hex");
}

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

router.post("/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters." });
    return;
  }
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const existing = await User.findOne({ email: normalEmail });

    if (existing) {
      if (existing.isVerified) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }
      const otp = generateOtp();
      existing.otp = otp;
      existing.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      existing.name = name.trim();
      existing.passwordHash = hashPassword(password, normalEmail);
      await existing.save();
      await sendOtpEmail(normalEmail, name.trim(), otp);
      res.json({ message: "OTP resent. Please check your email.", email: normalEmail });
      return;
    }

    const otp = generateOtp();
    const user = new User({
      name: name.trim(),
      email: normalEmail,
      passwordHash: hashPassword(password, normalEmail),
      isVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
    });
    await user.save();
    await sendOtpEmail(normalEmail, name.trim(), otp);

    res.status(201).json({
      message: "Account created. Please check your email for the verification code.",
      email: normalEmail,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required." });
    return;
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalEmail });

    if (!user) {
      res.status(404).json({ error: "No account found for this email." });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ error: "This account is already verified. Please sign in." });
      return;
    }
    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ error: "No verification code found. Please request a new one." });
      return;
    }
    if (new Date() > user.otpExpiry) {
      res.status(400).json({ error: "Your verification code has expired. Please request a new one." });
      return;
    }
    if (user.otp !== otp.trim()) {
      res.status(400).json({ error: "Incorrect verification code. Please try again." });
      return;
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      message: "Email verified successfully!",
      user: {
        id: (user._id as object).toString(),
        name: user.name,
        email: user.email,
        createdAt: (user.createdAt as Date).getTime(),
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalEmail });

    if (!user) {
      res.status(401).json({ error: "No account found with this email address." });
      return;
    }
    if (!user.isVerified) {
      res.status(403).json({
        error: "Your email is not verified yet. Please check your inbox for the verification code.",
        requiresVerification: true,
        email: normalEmail,
      });
      return;
    }
    if (user.passwordHash !== hashPassword(password, normalEmail)) {
      res.status(401).json({ error: "Incorrect password. Please try again." });
      return;
    }

    res.json({
      user: {
        id: (user._id as object).toString(),
        name: user.name,
        email: user.email,
        createdAt: (user.createdAt as Date).getTime(),
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/auth/resend-otp", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalEmail });

    if (!user) {
      res.status(404).json({ error: "No account found for this email." });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ error: "This account is already verified. Please sign in." });
      return;
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    await sendOtpEmail(normalEmail, user.name, otp);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
