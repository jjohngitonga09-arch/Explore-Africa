import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  bookingsTable,
  toursTable,
  tourPricingTable,
  tourImagesTable,
  countriesTable,
  usersTable,
} from "@workspace/db";
import {
  CreateBookingBody,
  MarkBookingPaidParams,
  GetAllBookingsQueryParams,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { serializeCountry } from "./countries";

const router: IRouter = Router();

function serializeBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    id: b.id,
    userId: b.userId,
    tourId: b.tourId,
    originCountryId: b.originCountryId,
    numberOfPeople: b.numberOfPeople,
    totalPrice: parseFloat(b.totalPrice),
    status: b.status,
    bookingDate: b.bookingDate.toISOString(),
    paymentDate: b.paymentDate?.toISOString() ?? null,
    notes: b.notes ?? null,
    // Immigration fields
    passportNumber: b.passportNumber ?? null,
    dateOfBirth: b.dateOfBirth ?? null,
    phone: b.phone ?? null,
    address: b.address ?? null,
    gender: b.gender ?? null,
    occupation: b.occupation ?? null,
    purposeOfTravel: b.purposeOfTravel ?? null,
    maritalStatus: b.maritalStatus ?? null,
    emergencyContact: b.emergencyContact ?? null,
    emergencyPhone: b.emergencyPhone ?? null,
  };
}

async function buildBookingDetail(booking: typeof bookingsTable.$inferSelect) {
  const [tour] = await db.select().from(toursTable).where(eq(toursTable.id, booking.tourId));
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName, nationality: usersTable.nationality, role: usersTable.role, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, booking.userId));
  const [originCountry] = await db.select().from(countriesTable).where(eq(countriesTable.id, booking.originCountryId));

  let tourData = null;
  if (tour) {
    const images = await db.select().from(tourImagesTable).where(eq(tourImagesTable.tourId, tour.id)).orderBy(tourImagesTable.sortOrder).limit(1);
    let destCountry = null;
    if (tour.destinationCountryId != null) {
      const [dc] = await db.select().from(countriesTable).where(eq(countriesTable.id, tour.destinationCountryId));
      if (dc) destCountry = serializeCountry(dc);
    }
    tourData = {
      id: tour.id,
      title: tour.title,
      description: tour.description,
      durationDays: tour.durationDays,
      destinationCountryId: tour.destinationCountryId ?? null,
      basePrice: parseFloat(tour.basePrice),
      highlights: tour.highlights ?? [],
      coverImage: images[0]?.imageUrl ?? null,
      destinationCountry: destCountry,
      createdAt: tour.createdAt.toISOString(),
      updatedAt: tour.updatedAt.toISOString(),
    };
  }

  return {
    ...serializeBooking(booking),
    tour: tourData,
    user: user ? { ...user, createdAt: user.createdAt.toISOString() } : null,
    originCountry: originCountry ? serializeCountry(originCountry) : null,
  };
}

// GET /bookings/mine — must come before /:id routes
router.get("/bookings/mine", requireAuth, async (req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, req.user!.userId));
  const details = await Promise.all(bookings.map(buildBookingDetail));
  res.json(details);
});

// GET /bookings/admin/all — must come before /bookings/admin/:id
router.get("/bookings/admin/all", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const query = GetAllBookingsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { status } = query.data;

  let bookings;
  if (status) {
    bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.status, status));
  } else {
    bookings = await db.select().from(bookingsTable);
  }

  const details = await Promise.all(bookings.map(buildBookingDetail));
  res.json(details);
});

// PATCH /bookings/admin/:id
router.patch("/bookings/admin/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof bookingsTable.$inferInsert> = { status: parsed.data.status };
  if (parsed.data.status === "paid") {
    updateData.paymentDate = new Date();
  }

  const [booking] = await db.update(bookingsTable).set(updateData).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(serializeBooking(booking));
});

// POST /bookings
router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const {
    tourId, originCountryId, numberOfPeople, notes,
    passportNumber, dateOfBirth, phone, address, gender,
    occupation, purposeOfTravel, maritalStatus, emergencyContact, emergencyPhone,
  } = parsed.data;

  const [tour] = await db.select().from(toursTable).where(eq(toursTable.id, tourId));
  if (!tour) {
    res.status(404).json({ error: "Tour not found" });
    return;
  }

  // Find country-specific pricing or fall back to base price
  const [pricing] = await db
    .select()
    .from(tourPricingTable)
    .where(and(eq(tourPricingTable.tourId, tourId), eq(tourPricingTable.originCountryId, originCountryId)));

  const pricePerPerson = pricing ? parseFloat(pricing.price) : parseFloat(tour.basePrice);
  const totalPrice = pricePerPerson * numberOfPeople;

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId: req.user!.userId,
      tourId,
      originCountryId,
      numberOfPeople,
      totalPrice: String(totalPrice),
      status: "pending",
      notes: notes ?? null,
      passportNumber: passportNumber ?? null,
      dateOfBirth: dateOfBirth ?? null,
      phone: phone ?? null,
      address: address ?? null,
      gender: gender ?? null,
      occupation: occupation ?? null,
      purposeOfTravel: purposeOfTravel ?? null,
      maritalStatus: maritalStatus ?? null,
      emergencyContact: emergencyContact ?? null,
      emergencyPhone: emergencyPhone ?? null,
    })
    .returning();

  res.status(201).json(serializeBooking(booking));
});

// POST /bookings/:id/mark-paid
router.post("/bookings/:id/mark-paid", requireAuth, async (req, res): Promise<void> => {
  const params = MarkBookingPaidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(bookingsTable).where(and(eq(bookingsTable.id, params.data.id), eq(bookingsTable.userId, req.user!.userId)));
  if (!existing) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ status: "paid", paymentDate: new Date() })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  res.json(serializeBooking(booking));
});

export default router;
