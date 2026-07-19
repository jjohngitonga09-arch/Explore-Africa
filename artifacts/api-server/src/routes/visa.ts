import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, visaServicesTable, visaCasesTable, caseDocumentsTable, countriesTable, usersTable } from "@workspace/db";
import {
  CreateVisaCaseBody,
  AddCaseDocumentParams,
  AddCaseDocumentBody,
  MarkFeePaidParams,
  CreateVisaServiceBody,
  UpdateVisaServiceParams,
  UpdateVisaServiceBody,
  GetAllVisaCasesQueryParams,
  GetVisaCaseAdminParams,
  UpdateVisaCaseStatusParams,
  UpdateVisaCaseStatusBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { serializeCountry } from "./countries";

const router: IRouter = Router();

function serializeVisaService(s: typeof visaServicesTable.$inferSelect, country?: typeof countriesTable.$inferSelect | null) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    fee: parseFloat(s.fee),
    destinationCountryId: s.destinationCountryId,
    requirements: s.requirements ?? [],
    isActive: s.isActive,
    destinationCountry: country ? serializeCountry(country) : null,
    createdAt: s.createdAt.toISOString(),
  };
}

function serializeCase(c: typeof visaCasesTable.$inferSelect) {
  return {
    id: c.id,
    userId: c.userId,
    visaServiceId: c.visaServiceId,
    status: c.status,
    feePaid: c.feePaid,
    submittedAt: c.submittedAt?.toISOString() ?? null,
    adminNotes: c.adminNotes ?? null,
    paymentInfo: c.paymentInfo ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

function serializeDocument(d: typeof caseDocumentsTable.$inferSelect) {
  return {
    id: d.id,
    visaCaseId: d.visaCaseId,
    documentType: d.documentType,
    fileUrl: d.fileUrl,
    uploadedAt: d.uploadedAt.toISOString(),
  };
}

async function buildCaseDetail(c: typeof visaCasesTable.$inferSelect) {
  const [service] = await db.select().from(visaServicesTable).where(eq(visaServicesTable.id, c.visaServiceId));
  const documents = await db.select().from(caseDocumentsTable).where(eq(caseDocumentsTable.visaCaseId, c.id));
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName, nationality: usersTable.nationality, role: usersTable.role, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, c.userId));

  let serviceData = null;
  if (service) {
    let country = null;
    const [destCountry] = await db.select().from(countriesTable).where(eq(countriesTable.id, service.destinationCountryId));
    if (destCountry) country = destCountry;
    serviceData = serializeVisaService(service, country);
  }

  return {
    ...serializeCase(c),
    service: serviceData,
    documents: documents.map(serializeDocument),
    user: user ? { ...user, createdAt: user.createdAt.toISOString() } : null,
  };
}

// GET /visa/services (public)
router.get("/visa/services", async (_req, res): Promise<void> => {
  const services = await db.select().from(visaServicesTable).where(eq(visaServicesTable.isActive, true));
  const result = await Promise.all(
    services.map(async (s) => {
      const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, s.destinationCountryId));
      return serializeVisaService(s, country);
    }),
  );
  res.json(result);
});

// POST /visa/cases
router.post("/visa/cases", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateVisaCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.select().from(visaServicesTable).where(eq(visaServicesTable.id, parsed.data.visaServiceId));
  if (!service) {
    res.status(404).json({ error: "Visa service not found" });
    return;
  }

  const [visaCase] = await db
    .insert(visaCasesTable)
    .values({ userId: req.user!.userId, visaServiceId: parsed.data.visaServiceId, status: "draft", feePaid: false })
    .returning();

  res.status(201).json(serializeCase(visaCase));
});

// GET /visa/cases/mine — must come before /visa/cases/:id
router.get("/visa/cases/mine", requireAuth, async (req, res): Promise<void> => {
  const cases = await db.select().from(visaCasesTable).where(eq(visaCasesTable.userId, req.user!.userId));
  const details = await Promise.all(cases.map(buildCaseDetail));
  res.json(details);
});

// POST /visa/cases/:id/documents
router.post("/visa/cases/:id/documents", requireAuth, async (req, res): Promise<void> => {
  const params = AddCaseDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddCaseDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [visaCase] = await db.select().from(visaCasesTable).where(and(eq(visaCasesTable.id, params.data.id), eq(visaCasesTable.userId, req.user!.userId)));
  if (!visaCase) {
    res.status(404).json({ error: "Visa case not found" });
    return;
  }

  const [doc] = await db
    .insert(caseDocumentsTable)
    .values({ visaCaseId: params.data.id, documentType: parsed.data.documentType, fileUrl: parsed.data.fileUrl })
    .returning();

  res.status(201).json(serializeDocument(doc));
});

// POST /visa/cases/:id/mark-fee-paid
router.post("/visa/cases/:id/mark-fee-paid", requireAuth, async (req, res): Promise<void> => {
  const params = MarkFeePaidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(visaCasesTable).where(and(eq(visaCasesTable.id, params.data.id), eq(visaCasesTable.userId, req.user!.userId)));
  if (!existing) {
    res.status(404).json({ error: "Visa case not found" });
    return;
  }

  const [updated] = await db
    .update(visaCasesTable)
    .set({ feePaid: true, status: "fee_paid" })
    .where(eq(visaCasesTable.id, params.data.id))
    .returning();

  res.json(serializeCase(updated));
});

// POST /visa/admin/services
router.post("/visa/admin/services", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateVisaServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db
    .insert(visaServicesTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      fee: String(parsed.data.fee),
      destinationCountryId: parsed.data.destinationCountryId,
      requirements: parsed.data.requirements ?? [],
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, service.destinationCountryId));
  res.status(201).json(serializeVisaService(service, country));
});

// PATCH /visa/admin/services/:id
router.patch("/visa/admin/services/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateVisaServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateVisaServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof visaServicesTable.$inferInsert> = {};
  const d = parsed.data;
  if (d.name != null) updateData.name = d.name;
  if (d.description != null) updateData.description = d.description;
  if (d.fee != null) updateData.fee = String(d.fee);
  if (d.destinationCountryId != null) updateData.destinationCountryId = d.destinationCountryId;
  if (d.requirements != null) updateData.requirements = d.requirements;
  if (d.isActive != null) updateData.isActive = d.isActive;

  const [service] = await db.update(visaServicesTable).set(updateData).where(eq(visaServicesTable.id, params.data.id)).returning();
  if (!service) {
    res.status(404).json({ error: "Visa service not found" });
    return;
  }

  const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, service.destinationCountryId));
  res.json(serializeVisaService(service, country));
});

// GET /visa/admin/cases
router.get("/visa/admin/cases", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const query = GetAllVisaCasesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { status } = query.data;

  let cases;
  if (status) {
    cases = await db.select().from(visaCasesTable).where(eq(visaCasesTable.status, status));
  } else {
    cases = await db.select().from(visaCasesTable);
  }

  const details = await Promise.all(cases.map(buildCaseDetail));
  res.json(details);
});

// GET /visa/admin/cases/:id — must come after /visa/admin/cases
router.get("/visa/admin/cases/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = GetVisaCaseAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [visaCase] = await db.select().from(visaCasesTable).where(eq(visaCasesTable.id, params.data.id));
  if (!visaCase) {
    res.status(404).json({ error: "Visa case not found" });
    return;
  }

  res.json(await buildCaseDetail(visaCase));
});

// PATCH /visa/admin/cases/:id/status
router.patch("/visa/admin/cases/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateVisaCaseStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateVisaCaseStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof visaCasesTable.$inferInsert> = { status: parsed.data.status };
  if (parsed.data.adminNotes != null) updateData.adminNotes = parsed.data.adminNotes;
  if (parsed.data.paymentInfo != null) updateData.paymentInfo = parsed.data.paymentInfo;
  if (parsed.data.status === "submitted") updateData.submittedAt = new Date();

  const [updated] = await db.update(visaCasesTable).set(updateData).where(eq(visaCasesTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Visa case not found" });
    return;
  }

  res.json(serializeCase(updated));
});

export default router;
