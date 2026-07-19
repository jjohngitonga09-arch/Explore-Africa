import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  // Extended profile fields
  phone: varchar("phone", { length: 30 }),
  passportNumber: varchar("passport_number", { length: 50 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
