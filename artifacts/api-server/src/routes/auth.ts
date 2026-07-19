import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth, signToken } from "../middlewares/auth";

const router: IRouter = Router();

function serializeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    nationality: user.nationality,
    role: user.role,
    phone: user.phone ?? null,
    passportNumber: user.passportNumber ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    address: user.address ?? null,
    emergencyContact: user.emergencyContact ?? null,
    emergencyPhone: user.emergencyPhone ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, fullName, nationality } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  // Require OTP verification before creating account
  const [otpRecord] = await db
    .select()
    .from(emailOtpsTable)
    .where(eq(emailOtpsTable.email, email.trim().toLowerCase()));

  if (!otpRecord?.verified) {
    res.status(400).json({ error: "Email not verified. Please complete the verification step." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, fullName, nationality, role: "user" })
    .returning();

  // Clean up used OTP record
  await db.delete(emailOtpsTable).where(eq(emailOtpsTable.email, email.trim().toLowerCase()));

  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: serializeUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user.id, user.role);
  res.json({ token, user: serializeUser(user) });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(user));
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const { fullName, nationality, phone, passportNumber, dateOfBirth, address, emergencyContact, emergencyPhone } = req.body;
  const update: Partial<typeof usersTable.$inferInsert> = {};
  if (fullName !== undefined) update.fullName = fullName;
  if (nationality !== undefined) update.nationality = nationality;
  if (phone !== undefined) update.phone = phone;
  if (passportNumber !== undefined) update.passportNumber = passportNumber;
  if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
  if (address !== undefined) update.address = address;
  if (emergencyContact !== undefined) update.emergencyContact = emergencyContact;
  if (emergencyPhone !== undefined) update.emergencyPhone = emergencyPhone;

  const [user] = await db
    .update(usersTable)
    .set(update)
    .where(eq(usersTable.id, req.user!.userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(user));
});

export default router;
