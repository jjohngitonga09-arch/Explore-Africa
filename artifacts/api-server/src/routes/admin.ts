import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, usersTable, bookingsTable, visaCasesTable, toursTable, countriesTable, galleryImagesTable } from "@workspace/db";
import {
  AddOriginCountryBody,
  AddDestinationCountryBody,
  DeleteCountryParams,
  AddGalleryImageBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { serializeCountry } from "./countries";

const router: IRouter = Router();

function serializeGalleryImage(g: typeof galleryImagesTable.$inferSelect, country?: typeof countriesTable.$inferSelect | null) {
  return {
    id: g.id,
    imageUrl: g.imageUrl,
    caption: g.caption ?? null,
    countryId: g.countryId ?? null,
    country: country ? serializeCountry(country) : null,
    sortOrder: g.sortOrder,
    createdAt: g.createdAt.toISOString(),
  };
}

// GET /admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [[userCount], [bookingCount], [tourCount], [pendingVisaCount], revenueResult, confirmedResult, cancelledResult] =
    await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(bookingsTable),
      db.select({ count: count() }).from(toursTable),
      db
        .select({ count: count() })
        .from(visaCasesTable)
        .where(sql`${visaCasesTable.status} IN ('draft','submitted','fee_paid','processing')`),
      db
        .select({ total: sql<string>`COALESCE(SUM(${bookingsTable.totalPrice}), 0)` })
        .from(bookingsTable)
        .where(sql`${bookingsTable.status} IN ('paid','confirmed')`),
      db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "confirmed")),
      db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "cancelled")),
    ]);

  res.json({
    totalUsers: userCount.count,
    totalBookings: bookingCount.count,
    totalRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
    pendingVisaCases: pendingVisaCount.count,
    totalTours: tourCount.count,
    confirmedBookings: confirmedResult[0]?.count ?? 0,
    cancelledBookings: cancelledResult[0]?.count ?? 0,
  });
});

// GET /admin/countries/origin
router.get("/admin/countries/origin", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const countries = await db.select().from(countriesTable).where(eq(countriesTable.type, "origin")).orderBy(countriesTable.name);
  res.json(countries.map(serializeCountry));
});

// POST /admin/countries/origin
router.post("/admin/countries/origin", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = AddOriginCountryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [country] = await db
    .insert(countriesTable)
    .values({ name: parsed.data.name, code: parsed.data.code ?? null, type: "origin" })
    .returning();
  res.status(201).json(serializeCountry(country));
});

// GET /admin/countries/destination
router.get("/admin/countries/destination", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const countries = await db.select().from(countriesTable).where(eq(countriesTable.type, "destination")).orderBy(countriesTable.name);
  res.json(countries.map(serializeCountry));
});

// POST /admin/countries/destination
router.post("/admin/countries/destination", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = AddDestinationCountryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [country] = await db
    .insert(countriesTable)
    .values({ name: parsed.data.name, code: parsed.data.code ?? null, type: "destination" })
    .returning();
  res.status(201).json(serializeCountry(country));
});

// DELETE /admin/countries/:id
router.delete("/admin/countries/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCountryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [country] = await db.delete(countriesTable).where(eq(countriesTable.id, params.data.id)).returning();
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  res.sendStatus(204);
});

// GET /admin/gallery
router.get("/admin/gallery", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const images = await db.select().from(galleryImagesTable).orderBy(galleryImagesTable.sortOrder);
  const result = await Promise.all(
    images.map(async (g) => {
      let country = null;
      if (g.countryId != null) {
        const [c] = await db.select().from(countriesTable).where(eq(countriesTable.id, g.countryId));
        if (c) country = c;
      }
      return serializeGalleryImage(g, country);
    }),
  );
  res.json(result);
});

// POST /admin/gallery
router.post("/admin/gallery", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = AddGalleryImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [image] = await db
    .insert(galleryImagesTable)
    .values({
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption ?? null,
      countryId: parsed.data.countryId ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(serializeGalleryImage(image, null));
});

// DELETE /admin/gallery/:id
router.delete("/admin/gallery/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [image] = await db.delete(galleryImagesTable).where(eq(galleryImagesTable.id, id)).returning();
  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.sendStatus(204);
});

export { serializeGalleryImage };
export default router;
