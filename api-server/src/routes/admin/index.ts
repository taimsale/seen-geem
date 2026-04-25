import { Router, type IRouter } from "express";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  db,
  categoriesTable,
  questionsTable,
  usersTable,
  promoCodesTable,
  productsTable,
} from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateQuestionBody,
  UpdateQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionResponse,
  DeleteQuestionParams,
  DeleteCategoryParams,
  ListUsersResponse,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserResponse,
  ListCodesResponse,
  CreateCodesBody,
  DeleteCodeParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
  AiGenerateQuestionsBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../../lib/auth";
import { openai } from "../../lib/openaiClient";
import { logger } from "../../lib/logger";

const router: IRouter = Router();
router.use(requireAuth, requireAdmin);

// Categories
router.post("/admin/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const name = parsed.data.name.trim();
  if (!name) { res.status(400).json({ error: "الاسم مطلوب" }); return; }
  try {
    const [c] = await db.insert(categoriesTable).values({
      name,
      imageUrl: parsed.data.imageUrl ?? null,
    }).returning();
    res.status(201).json({ id: c.id, name: c.name, imageUrl: c.imageUrl, questionCount: 0 });
  } catch {
    res.status(409).json({ error: "تصنيف بنفس الاسم موجود" });
  }
});

router.patch("/admin/categories/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "id غير صالح" }); return; }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  const [c] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  if (!c) { res.status(404).json({ error: "غير موجود" }); return; }
  res.json({ id: c.id, name: c.name, imageUrl: c.imageUrl, questionCount: 0 });
});

router.delete("/admin/categories/:id", async (req, res): Promise<void> => {
  const p = DeleteCategoryParams.safeParse(req.params);
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, p.data.id));
  res.sendStatus(204);
});

// Questions
router.get("/admin/questions", async (req, res): Promise<void> => {
  const catId = req.query.categoryId ? Number(req.query.categoryId) : null;
  const rows = catId
    ? await db.select().from(questionsTable).where(eq(questionsTable.categoryId, catId))
    : await db.select().from(questionsTable);
  res.json(rows.map((q) => ({
    id: q.id, categoryId: q.categoryId, text: q.text,
    answer: q.answer, image: q.image, points: q.points,
  })));
});

router.post("/admin/questions", async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [q] = await db.insert(questionsTable).values({
    categoryId: parsed.data.categoryId,
    text: parsed.data.text,
    answer: parsed.data.answer,
    image: parsed.data.image ?? null,
    points: parsed.data.points,
  }).returning();
  res.status(201).json({
    id: q.id, categoryId: q.categoryId, text: q.text, answer: q.answer, image: q.image, points: q.points,
  });
});

router.patch("/admin/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [q] = await db.update(questionsTable).set(parsed.data).where(eq(questionsTable.id, params.data.id)).returning();
  if (!q) { res.status(404).json({ error: "غير موجود" }); return; }
  res.json(UpdateQuestionResponse.parse({
    id: q.id, categoryId: q.categoryId, text: q.text, answer: q.answer, image: q.image, points: q.points,
  }));
});

router.delete("/admin/questions/:id", async (req, res): Promise<void> => {
  const p = DeleteQuestionParams.safeParse(req.params);
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  await db.delete(questionsTable).where(eq(questionsTable.id, p.data.id));
  res.sendStatus(204);
});

// AI question generation
const POINT_TIERS = [100, 200, 300, 400, 500, 600];

router.post("/admin/ai/generate-questions", async (req, res): Promise<void> => {
  const parsed = AiGenerateQuestionsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, categoryId: providedCategoryId, createCategory } = parsed.data;
  const cleanTopic = topic.trim();
  if (!cleanTopic) { res.status(400).json({ error: "الموضوع مطلوب" }); return; }

  // Resolve target category
  let targetCategory: typeof categoriesTable.$inferSelect | undefined;
  if (providedCategoryId) {
    const [c] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, providedCategoryId));
    if (!c) { res.status(404).json({ error: "التصنيف غير موجود" }); return; }
    targetCategory = c;
  } else if (createCategory !== false) {
    try {
      const [c] = await db.insert(categoriesTable).values({ name: cleanTopic }).returning();
      targetCategory = c;
    } catch {
      const [existing] = await db.select().from(categoriesTable).where(eq(categoriesTable.name, cleanTopic));
      if (!existing) { res.status(409).json({ error: "تعذر إنشاء التصنيف" }); return; }
      targetCategory = existing;
    }
  } else {
    res.status(400).json({ error: "يجب تحديد categoryId أو السماح بإنشاء تصنيف" }); return;
  }

  const prompt = `أنت مولّد أسئلة معرفة عامة باللغة العربية. أنشئ بالضبط 6 أسئلة عن الموضوع: "${cleanTopic}".
- يجب أن تكون كل الأسئلة وأجوبتها باللغة العربية الفصحى.
- يجب أن يكون مستوى الصعوبة متدرجاً من السهل إلى الصعب.
- أعد الإجابة فقط بصيغة JSON صالحة بالشكل التالي بدون أي نص إضافي:
{"questions":[{"text":"...","answer":"..."},{"text":"...","answer":"..."},{"text":"...","answer":"..."},{"text":"...","answer":"..."},{"text":"...","answer":"..."},{"text":"...","answer":"..."}]}`;

  let parsedJson: { questions?: Array<{ text?: string; answer?: string }> };
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    parsedJson = JSON.parse(content);
  } catch (err) {
    logger.error({ err }, "AI generation failed");
    res.status(502).json({ error: "تعذر توليد الأسئلة، حاول مرة أخرى" });
    return;
  }

  const items = (parsedJson.questions ?? []).filter(
    (q): q is { text: string; answer: string } =>
      typeof q?.text === "string" && typeof q?.answer === "string" && q.text.length > 0 && q.answer.length > 0,
  ).slice(0, 6);

  if (items.length < 6) {
    res.status(502).json({ error: "النموذج لم يُرجع 6 أسئلة صالحة" });
    return;
  }

  const inserted = await db.insert(questionsTable).values(
    items.map((q, i) => ({
      categoryId: targetCategory!.id,
      text: q.text,
      answer: q.answer,
      points: POINT_TIERS[i],
    })),
  ).returning();

  res.status(201).json({
    categoryId: targetCategory.id,
    categoryName: targetCategory.name,
    created: inserted.map((q) => ({
      id: q.id, categoryId: q.categoryId, text: q.text, answer: q.answer, image: q.image, points: q.points,
    })),
  });
});

// Users
router.get("/admin/users", async (_req, res): Promise<void> => {
  const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(ListUsersResponse.parse(rows.map((u) => ({
    id: u.id, email: u.email, name: u.name, isAdmin: u.isAdmin,
    roundsBalance: u.roundsBalance, createdAt: u.createdAt.toISOString(),
  }))));
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (typeof parsed.data.roundsBalance === "number") updates.roundsBalance = parsed.data.roundsBalance;
  if (typeof parsed.data.isAdmin === "boolean") updates.isAdmin = parsed.data.isAdmin;
  const [u] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  if (!u) { res.status(404).json({ error: "غير موجود" }); return; }
  res.json(UpdateUserResponse.parse({
    id: u.id, email: u.email, name: u.name, isAdmin: u.isAdmin,
    roundsBalance: u.roundsBalance, createdAt: u.createdAt.toISOString(),
  }));
});

// Promo codes
function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

router.get("/admin/codes", async (_req, res): Promise<void> => {
  const rows = await db.select().from(promoCodesTable).orderBy(desc(promoCodesTable.createdAt));
  res.json(ListCodesResponse.parse(rows.map((c) => ({
    id: c.id, code: c.code, roundsValue: c.roundsValue, maxUses: c.maxUses,
    usedCount: c.usedCount, createdAt: c.createdAt.toISOString(),
  }))));
});

router.post("/admin/codes", async (req, res): Promise<void> => {
  const parsed = CreateCodesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const count = Math.max(1, Math.min(parsed.data.count ?? 1, 100));
  const created: typeof promoCodesTable.$inferSelect[] = [];
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 5) {
      try {
        const [c] = await db.insert(promoCodesTable).values({
          code: genCode(),
          roundsValue: parsed.data.roundsValue,
          maxUses: parsed.data.maxUses,
        }).returning();
        created.push(c);
        break;
      } catch { attempts++; }
    }
  }
  res.status(201).json(created.map((c) => ({
    id: c.id, code: c.code, roundsValue: c.roundsValue, maxUses: c.maxUses,
    usedCount: c.usedCount, createdAt: c.createdAt.toISOString(),
  })));
});

router.delete("/admin/codes/:id", async (req, res): Promise<void> => {
  const p = DeleteCodeParams.safeParse(req.params);
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  await db.delete(promoCodesTable).where(eq(promoCodesTable.id, p.data.id));
  res.sendStatus(204);
});

// Products (admin)
router.get("/admin/products", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable).orderBy(asc(productsTable.sortOrder), asc(productsTable.priceCents));
  res.json(rows);
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const discount = Math.max(0, Math.min(parsed.data.discountPercent ?? 0, 95));
  const [p] = await db.insert(productsTable).values({
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    rounds: parsed.data.rounds,
    priceCents: parsed.data.priceCents,
    discountPercent: discount,
    currency: parsed.data.currency ?? "USD",
    payhipUrl: parsed.data.payhipUrl ?? "",
    badge: parsed.data.badge ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
    active: parsed.data.active ?? true,
  }).returning();
  res.status(201).json(p);
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Partial<typeof productsTable.$inferInsert> = { ...parsed.data };
  if (typeof updates.discountPercent === "number") {
    updates.discountPercent = Math.max(0, Math.min(updates.discountPercent, 95));
  }
  const [p] = await db.update(productsTable).set(updates).where(eq(productsTable.id, params.data.id)).returning();
  if (!p) { res.status(404).json({ error: "غير موجود" }); return; }
  res.json(p);
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
// Avoid unused import warning for sql when no usage:
void sql;
