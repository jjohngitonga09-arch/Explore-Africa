import { pgTable, serial, varchar, char, timestamp, boolean } from "drizzle-orm/pg-core";

export const emailOtpsTable = pgTable("email_otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  otp: char("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EmailOtp = typeof emailOtpsTable.$inferSelect;
