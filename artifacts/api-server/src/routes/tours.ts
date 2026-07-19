import { Router, type IRouter } from "express";
import { eq, and, lte, gte, inArray, desc, type SQL } from "drizzle-orm";
import { db, toursTable, tourImagesTable, tourPricingTable, countriesTable } from "@workspace/db";
import {
  ListToursQueryParams,
  GetTourParams,
  UpdateTourParams,
  DeleteTourParams,
  AddTourImageParams,
  AddTourImageBody,
  RemoveTourImageParams,
  SetTourPricingParams,
  SetTourPricingBody,
  CreateTourBody,
  UpdateTourBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { serializeCountry } from "./countries";

const router: IRouter = Router();

function serializeImage(img: typeof tourImagesTable.$inferSelect) {
  return {
    id: img.id,
    tourId: img.tourId,
    imageUrl: img.imageUrl,
    caption: img.caption ?? null,
    sortOrder: img.sortOrder,
  };
}

function serializePricing(p: typeof tourPricingTable.$inferSelect) {
  return {
    id: p.id,
    tourId: p.tourId,
    originCountryId: p.originCountryId,
    price: parseFloat(p.price),
  };
}

function serializeTour(tour: typeof toursTable.$inferSelect) {
  return {
    id: tour.id,
    title: tour.title,
    description: tour.description,
    durationDays: tour.durationDays,
    destinationCountryId: tour.destinationCountryId ?? null,
    basePrice: parseFloat(tour.basePrice),
    highlights: tour.highlights ?? [],
    included: tour.included ?? [],
    notIncluded: tour.notIncluded ?? [],
    createdAt: tour.createdAt.toISOString(),
    updatedAt: tour.updatedAt.toISOString(),
  };
}

// GET /tours
router.get("/tours", async (req, res): Promise<void> => {
  const query = ListToursQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { destinationCountryId, maxPrice, minDays, maxDays } = query.data;

  const conditions: SQL[] = [];
  if (destinationCountryId != null) conditions.push(eq(toursTable.destinationCountryId, destinationCountryId));
  if (minDays != null) conditions.push(gte(toursTable.durationDays, minDays));
  if (maxDays != null) conditions.push(lte(toursTable.durationDays, maxDays));

  const tours = await db
    .select()
    .from(toursTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(toursTable.createdAt));

  // Filter by maxPrice after fetching (decimal comparison)
  const filtered = maxPrice != null ? tours.filter((t) => parseFloat(t.basePrice) <= maxPrice) : tours;

  if (filtered.length === 0) {
    res.json([]);
    return;
  }

  // Get cover image (first image by sort_order) for each tour
  const tourIds = filtered.map((t) => t.id);
  const images = await db
    .select()
    .from(tourImagesTable)
    .where(inArray(tourImagesTable.tourId, tourIds))
    .orderBy(tourImagesTable.tourId, tourImagesTable.sortOrder);

  const coverImages: Record<number, string> = {};
  for (const img of images) {
    if (!(img.tourId in coverImages)) coverImages[img.tourId] = img.imageUrl;
  }

  // Get destination countries
  const destCountryIds = [...new Set(filtered.map((t) => t.destinationCountryId).filter(Boolean))] as number[];
  const countries =
    destCountryIds.length > 0
      ? await db.select().from(countriesTable).where(inArray(countriesTable.id, destCountryIds))
      : [];
  const countryMap: Record<number, typeof countriesTable.$inferSelect> = {};
  for (const c of countries) countryMap[c.id] = c;

  res.json(
    filtered.map((t) => ({
      ...serializeTour(t),
      coverImage: coverImages[t.id] ?? null,
      destinationCountry: t.destinationCountryId != null ? serializeCountry(countryMap[t.destinationCountryId]) ?? null : null,
    })),
  );
});

// POST /tours (admin)
router.post("/tours", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateTourBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { title, description, durationDays, destinationCountryId, basePrice, highlights, included, notIncluded } =
    parsed.data;

  const [tour] = await db
    .insert(toursTable)
    .values({
      title,
      description,
      durationDays,
      destinationCountryId: destinationCountryId ?? null,
      basePrice: String(basePrice),
      highlights: highlights ?? [],
      included: included ?? [],
      notIncluded: notIncluded ?? [],
    })
    .returning();

  res.status(201).json(serializeTour(tour));
});

// GET /tours/:id
router.get("/tours/:id", async (req, res): Promise<void> => {
  const params = GetTourParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tour] = await db.select().from(toursTable).where(eq(toursTable.id, params.data.id));
  if (!tour) {
    res.status(404).json({ error: "Tour not found" });
    return;
  }

  const images = await db
    .select()
    .from(tourImagesTable)
    .where(eq(tourImagesTable.tourId, tour.id))
    .orderBy(tourImagesTable.sortOrder);

  const pricing = await db.select().from(tourPricingTable).where(eq(tourPricingTable.tourId, tour.id));

  let destinationCountry = null;
  if (tour.destinationCountryId != null) {
    const [country] = await db.select().from(countriesTable).where(eq(countriesTable.id, tour.destinationCountryId));
    if (country) destinationCountry = serializeCountry(country);
  }

  res.json({
    ...serializeTour(tour),
    images: images.map(serializeImage),
    pricing: pricing.map(serializePricing),
    destinationCountry,
  });
});

// PUT /tours/:id (admin)
router.put("/tours/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateTourParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTourBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof toursTable.$inferInsert> = {};
  const d = parsed.data;
  if (d.title != null) updateData.title = d.title;
  if (d.description != null) updateData.description = d.description;
  if (d.durationDays != null) updateData.durationDays = d.durationDays;
  if (d.destinationCountryId != null) updateData.destinationCountryId = d.destinationCountryId;
  if (d.basePrice != null) updateData.basePrice = String(d.basePrice);
  if (d.highlights != null) updateData.highlights = d.highlights;
  if (d.included != null) updateData.included = d.included;
  if (d.notIncluded != null) updateData.notIncluded = d.notIncluded;

  const [tour] = await db.update(toursTable).set(updateData).where(eq(toursTable.id, params.data.id)).returning();

  if (!tour) {
    res.status(404).json({ error: "Tour not found" });
    return;
  }

  res.json(serializeTour(tour));
});

// DELETE /tours/:id (admin)
router.delete("/tours/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteTourParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tour] = await db.delete(toursTable).where(eq(toursTable.id, params.data.id)).returning();
  if (!tour) {
    res.status(404).json({ error: "Tour not found" });
    return;
  }

  res.sendStatus(204);
});

// POST /tours/:id/images (admin)
router.post("/tours/:id/images", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = AddTourImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddTourImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [image] = await db
    .insert(tourImagesTable)
    .values({
      tourId: params.data.id,
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  res.status(201).json(serializeImage(image));
});

// DELETE /tours/:id/images/:imageId (admin)
router.delete("/tours/:id/images/:imageId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = RemoveTourImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [img] = await db
    .delete(tourImagesTable)
    .where(and(eq(tourImagesTable.id, params.data.imageId), eq(tourImagesTable.tourId, params.data.id)))
    .returning();

  if (!img) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  res.sendStatus(204);
});

// POST /tours/:id/pricing (admin)
router.post("/tours/:id/pricing", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = SetTourPricingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SetTourPricingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Upsert pricing manually (check-then-insert-or-update)
  const [existing] = await db
    .select()
    .from(tourPricingTable)
    .where(and(eq(tourPricingTable.tourId, params.data.id), eq(tourPricingTable.originCountryId, parsed.data.originCountryId)));

  let pricing;
  if (existing) {
    [pricing] = await db
      .update(tourPricingTable)
      .set({ price: String(parsed.data.price) })
      .where(eq(tourPricingTable.id, existing.id))
      .returning();
  } else {
    [pricing] = await db
      .insert(tourPricingTable)
      .values({ tourId: params.data.id, originCountryId: parsed.data.originCountryId, price: String(parsed.data.price) })
      .returning();
  }

  res.json(serializePricing(pricing));
});

export default router;
