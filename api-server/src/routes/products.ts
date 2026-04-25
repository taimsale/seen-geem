import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { ListProductsResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/products", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.active, true))
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.priceCents));
  res.json(ListProductsResponse.parse(rows));
});

export default router;
