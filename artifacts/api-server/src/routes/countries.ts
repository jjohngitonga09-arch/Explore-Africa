import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, countriesTable } from "@workspace/db";

const router: IRouter = Router();

function serializeCountry(c: typeof countriesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    code: c.code ?? null,
    type: c.type,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/countries/origin", async (_req, res): Promise<void> => {
  const countries = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.type, "origin"))
    .orderBy(countriesTable.name);
  res.json(countries.map(serializeCountry));
});

router.get("/countries/destination", async (_req, res): Promise<void> => {
  const countries = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.type, "destination"))
    .orderBy(countriesTable.name);
  res.json(countries.map(serializeCountry));
});

export { serializeCountry };
export default router;
