import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

function serializeSiteSettings(s: typeof siteSettingsTable.$inferSelect) {
  return {
    id: s.id,
    headerCarouselIntervalMs: s.headerCarouselIntervalMs,
    updatedAt: s.updatedAt.toISOString(),
  };
}

async function getOrCreateSettings() {
  const [existing] = await db.select().from(siteSettingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(siteSettingsTable).values({}).returning();
  return created;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(serializeSiteSettings(settings));
});

export default router;
export { getOrCreateSettings, serializeSiteSettings };
