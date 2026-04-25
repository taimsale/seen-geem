import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, categoriesTable, questionsTable } from "@workspace/db";
import { ListCategoriesResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/categories", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      imageUrl: categoriesTable.imageUrl,
      questionCount: sql<number>`count(${questionsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(questionsTable, eq(questionsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.name);
  res.json(ListCategoriesResponse.parse(rows));
});

export default router;
