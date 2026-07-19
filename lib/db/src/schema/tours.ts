import { pgTable, serial, varchar, text, integer, decimal, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { countriesTable } from "./countries";

export const toursTable = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(),
  destinationCountryId: integer("destination_country_id").references(() => countriesTable.id),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  highlights: text("highlights").array().notNull().default([]),
  included: text("included").array().notNull().default([]),
  notIncluded: text("not_included").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const tourImagesTable = pgTable("tour_images", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id")
    .references(() => toursTable.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 200 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tourPricingTable = pgTable(
  "tour_pricing",
  {
    id: serial("id").primaryKey(),
    tourId: integer("tour_id")
      .references(() => toursTable.id, { onDelete: "cascade" })
      .notNull(),
    originCountryId: integer("origin_country_id")
      .references(() => countriesTable.id)
      .notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [unique("tour_pricing_tour_origin_unique").on(table.tourId, table.originCountryId)],
);

export const insertTourSchema = createInsertSchema(toursTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTourImageSchema = createInsertSchema(tourImagesTable).omit({ id: true });
export const insertTourPricingSchema = createInsertSchema(tourPricingTable).omit({ id: true });

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof toursTable.$inferSelect;
export type TourImage = typeof tourImagesTable.$inferSelect;
export type TourPricing = typeof tourPricingTable.$inferSelect;
