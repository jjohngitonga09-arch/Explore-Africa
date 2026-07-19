import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, emailOtpsTable } from "@workspace/db";
import { sendOtpEmail } from "../services/email";

const router: IRouter = Router();

// POST /auth/send-otp
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP record
  await db
    .insert(emailOtpsTable)
    .values({ email: normalizedEmail, otp, expiresAt, verified: false })
    .onConflictDoUpdate({
      target: emailOtpsTable.email,
      set: { otp, expiresAt, verified: false, createdAt: new Date() },
    });

  // Dev mode: no Gmail credentials configured → return OTP directly
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    res.json({
      message: "Dev mode — email not sent. Use the code shown below.",
      devOtp: otp,
    });
    return;
  }

  try {
    await sendOtpEmail(normalizedEmail, otp);
    res.json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("Gmail send error:", err);
    res.status(500).json({ error: "Failed to send email. Check GMAIL_USER and GMAIL_APP_PASSWORD secrets." });
  }
});

// POST /auth/verify-otp
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and code are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [record] = await db
    .select()
    .from(emailOtpsTable)
    .where(eq(emailOtpsTable.email, normalizedEmail));

  if (!record) {
    res.status(400).json({ error: "No verification code found. Please request a new one." });
    return;
  }
  if (record.otp !== otp.toString().trim()) {
    res.status(400).json({ error: "Incorrect verification code." });
    return;
  }
  if (record.expiresAt < new Date()) {
    res.status(400).json({ error: "Code expired. Please request a new one." });
    return;
  }

  await db
    .update(emailOtpsTable)
    .set({ verified: true })
    .where(eq(emailOtpsTable.email, normalizedEmail));

  res.json({ verified: true });
});

export default router;
