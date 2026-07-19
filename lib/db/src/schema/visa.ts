import { pgTable, serial, integer, decimal, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { countriesTable } from "./countries";

export const visaServicesTable = pgTable("visa_services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  destinationCountryId: integer("destination_country_id")
    .references(() => countriesTable.id)
    .notNull(),
  requirements: text("requirements").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visaCasesTable = pgTable("visa_cases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  visaServiceId: integer("visa_service_id")
    .references(() => visaServicesTable.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  feePaid: boolean("fee_paid").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const caseDocumentsTable = pgTable("case_documents", {
  id: serial("id").primaryKey(),
  visaCaseId: integer("visa_case_id")
    .references(() => visaCasesTable.id, { onDelete: "cascade" })
    .notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVisaServiceSchema = createInsertSchema(visaServicesTable).omit({ id: true, createdAt: true });
export const insertVisaCaseSchema = createInsertSchema(visaCasesTable).omit({ id: true, createdAt: true });
export const insertCaseDocumentSchema = createInsertSchema(caseDocumentsTable).omit({ id: true, uploadedAt: true });

export type InsertVisaService = z.infer<typeof insertVisaServiceSchema>;
export type VisaService = typeof visaServicesTable.$inferSelect;
export type InsertVisaCase = z.infer<typeof insertVisaCaseSchema>;
export type VisaCase = typeof visaCasesTable.$inferSelect;
export type CaseDocument = typeof caseDocumentsTable.$inferSelect;
