import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sponsorshipsTable, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { sendSponsorshipAcceptedEmail } from "../services/email";

const router: IRouter = Router();

function serializeSponsorship(s: typeof sponsorshipsTable.$inferSelect) {
  return {
    id: s.id,
    userId: s.userId,
    fullName: s.fullName,
    email: s.email,
    nationality: s.nationality,
    passportNumber: s.passportNumber ?? null,
    purpose: s.purpose,
    status: s.status,
    adminNotes: s.adminNotes ?? null,
    airportInstructions: s.airportInstructions ?? null,
    sponsorshipFee: s.sponsorshipFee ? parseFloat(s.sponsorshipFee) : null,
    feePaid: s.feePaid,
    acceptedAt: s.acceptedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

// GET /sponsorships/mine
router.get("/sponsorships/mine", requireAuth, async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(sponsorshipsTable)
    .where(eq(sponsorshipsTable.userId, req.user!.userId));
  res.json(items.map(serializeSponsorship));
});

// POST /sponsorships
router.post("/sponsorships", requireAuth, async (req, res): Promise<void> => {
  const { fullName, email, nationality, passportNumber, purpose } = req.body;
  if (!fullName || !email || !nationality || !purpose) {
    res.status(400).json({ error: "fullName, email, nationality, and purpose are required" });
    return;
  }
  const [s] = await db
    .insert(sponsorshipsTable)
    .values({
      userId: req.user!.userId,
      fullName,
      email,
      nationality,
      passportNumber: passportNumber || null,
      purpose,
      status: "pending",
    })
    .returning();
  res.status(201).json(serializeSponsorship(s));
});

// POST /sponsorships/:id/pay
router.post("/sponsorships/:id/pay", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [existing] = await db
    .select()
    .from(sponsorshipsTable)
    .where(eq(sponsorshipsTable.id, id));
  if (!existing || existing.userId !== req.user!.userId) {
    res.status(404).json({ error: "Sponsorship not found" });
    return;
  }
  if (existing.status !== "accepted") {
    res.status(400).json({ error: "Cannot pay — sponsorship not yet accepted" });
    return;
  }
  const [updated] = await db
    .update(sponsorshipsTable)
    .set({ feePaid: true })
    .where(eq(sponsorshipsTable.id, id))
    .returning();
  res.json(serializeSponsorship(updated));
});

// GET /admin/sponsorships
router.get("/admin/sponsorships", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(sponsorshipsTable).orderBy(sponsorshipsTable.createdAt);
  res.json(items.map(serializeSponsorship));
});

// PATCH /admin/sponsorships/:id
router.patch("/admin/sponsorships/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status, adminNotes, airportInstructions, sponsorshipFee } = req.body;
  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  const updateData: Partial<typeof sponsorshipsTable.$inferInsert> = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (airportInstructions !== undefined) updateData.airportInstructions = airportInstructions;
  if (sponsorshipFee !== undefined && sponsorshipFee !== null && sponsorshipFee !== "") {
    updateData.sponsorshipFee = String(sponsorshipFee);
  }
  if (status === "accepted") updateData.acceptedAt = new Date();

  const [updated] = await db
    .update(sponsorshipsTable)
    .set(updateData)
    .where(eq(sponsorshipsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Sponsorship not found" });
    return;
  }

  // Send acceptance email
  if (status === "accepted") {
    try {
      await sendSponsorshipAcceptedEmail(
        updated.email,
        updated.fullName,
        updated.airportInstructions ?? undefined,
      );
    } catch (err) {
      // Non-fatal — log but don't fail the response
      console.error("Failed to send sponsorship acceptance email:", err);
    }
  }

  res.json(serializeSponsorship(updated));
});

export default router;
