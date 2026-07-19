import { pgTable, serial, integer, decimal, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { toursTable } from "./tours";
import { countriesTable } from "./countries";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  tourId: integer("tour_id")
    .references(() => toursTable.id)
    .notNull(),
  originCountryId: integer("origin_country_id")
    .references(() => countriesTable.id)
    .notNull(),
  numberOfPeople: integer("number_of_people").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  bookingDate: timestamp("booking_date", { withTimezone: true }).notNull().defaultNow(),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  notes: text("notes"),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, bookingDate: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
