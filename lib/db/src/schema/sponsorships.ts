import { pgTable, serial, integer, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const sponsorshipsTable = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  passportNumber: varchar("passport_number", { length: 50 }),
  purpose: text("purpose").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  airportInstructions: text("airport_instructions"),
  feePaid: boolean("fee_paid").notNull().default(false),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSponsorshipSchema = createInsertSchema(sponsorshipsTable).omit({ id: true, createdAt: true });
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorshipsTable.$inferSelect;
