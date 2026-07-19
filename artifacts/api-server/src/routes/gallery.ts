import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryImagesTable, countriesTable } from "@workspace/db";
import { serializeCountry } from "./countries";

const router: IRouter = Router();

router.get("/gallery", async (_req, res): Promise<void> => {
  const images = await db.select().from(galleryImagesTable).orderBy(galleryImagesTable.sortOrder);

  const result = await Promise.all(
    images.map(async (g) => {
      let country = null;
      if (g.countryId != null) {
        const [c] = await db.select().from(countriesTable).where(eq(countriesTable.id, g.countryId));
        if (c) country = serializeCountry(c);
      }
      return {
        id: g.id,
        imageUrl: g.imageUrl,
        caption: g.caption ?? null,
        countryId: g.countryId ?? null,
        country,
        sortOrder: g.sortOrder,
        createdAt: g.createdAt.toISOString(),
      };
    }),
  );

  res.json(result);
});

export default router;
