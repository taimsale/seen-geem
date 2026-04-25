import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { db, gamesTable, categoriesTable, questionsTable, usersTable } from "@workspace/db";
import {
  GetActiveGameResponse,
  StartGameBody,
  UpdateActiveGameBody,
  UpdateActiveGameResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function serializeGame(g: typeof gamesTable.$inferSelect) {
  return {
    id: g.id,
    teams: g.teamsData,
    categories: g.categoriesData,
    usedQuestionIds: g.usedQuestionIds,
  };
}

router.get("/game/active", requireAuth, async (req, res): Promise<void> => {
  const [g] = await db
    .select()
    .from(gamesTable)
    .where(and(eq(gamesTable.userId, req.user!.id), eq(gamesTable.isActive, true)))
    .orderBy(gamesTable.createdAt)
    .limit(1);
  if (!g) {
    res.json(null);
    return;
  }
  res.json(GetActiveGameResponse.parse(serializeGame(g)));
});

router.post("/game/start", requireAuth, async (req, res): Promise<void> => {
  const parsed = StartGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { teams, categoryIds } = parsed.data;
  if (categoryIds.length !== 6) {
    res.status(400).json({ error: "يجب اختيار 6 تصنيفات بالضبط" });
    return;
  }
  if (req.user!.roundsBalance < 1) {
    res.status(402).json({ error: "لا توجد جولات متاحة. يرجى شراء أو استبدال كود" });
    return;
  }

  // End any active games first
  await db
    .update(gamesTable)
    .set({ isActive: false })
    .where(and(eq(gamesTable.userId, req.user!.id), eq(gamesTable.isActive, true)));

  // Load categories + questions
  const cats = await db
    .select()
    .from(categoriesTable)
    .where(inArray(categoriesTable.id, categoryIds));
  const qs = await db
    .select()
    .from(questionsTable)
    .where(inArray(questionsTable.categoryId, categoryIds));

  const seenSet = new Set<number>(req.user!.seenQuestionIds ?? []);
  const POINT_TIERS = [100, 200, 300, 400, 500, 600];
  const pickedIds: number[] = [];
  // Per-category seen IDs that should be CLEARED from the user's seen set
  // because that category's pool was exhausted (cycle complete → fresh start).
  const seenToClear = new Set<number>();

  const pickRandom = <T,>(arr: T[]): T | undefined =>
    arr.length === 0 ? undefined : arr[Math.floor(Math.random() * arr.length)];

  const categoriesData = categoryIds
    .map((cid) => {
      const cat = cats.find((c) => c.id === cid);
      if (!cat) return null;
      const catQs = qs.filter((q) => q.categoryId === cid);
      if (catQs.length < 6) return null;

      // Per-category exhaustion check: if EVERY question in this category
      // has already been seen, treat all of them as fresh again (release-only
      // for this category — other categories keep their seen history).
      const allCatSeen = catQs.every((q) => seenSet.has(q.id));
      const localSeen = new Set<number>(allCatSeen ? [] : catQs.filter((q) => seenSet.has(q.id)).map((q) => q.id));
      if (allCatSeen) catQs.forEach((q) => seenToClear.add(q.id));

      const chosen: { id: number; text: string; answer: string; image: string | null; points: number }[] = [];
      const usedInThisCat = new Set<number>();

      for (const tier of POINT_TIERS) {
        // 1) Strict: same tier, unseen, not yet picked in this game.
        const tierUnseen = catQs.filter(
          (q) => q.points === tier && !usedInThisCat.has(q.id) && !localSeen.has(q.id),
        );
        // 2) Tier-relaxed: any tier, unseen, not picked yet (preserve no-repeat).
        const anyUnseen = catQs.filter(
          (q) => !usedInThisCat.has(q.id) && !localSeen.has(q.id),
        );
        // 3) Last resort: any not-yet-picked-in-this-game.
        const anyAvailable = catQs.filter((q) => !usedInThisCat.has(q.id));

        const pick = pickRandom(tierUnseen) ?? pickRandom(anyUnseen) ?? pickRandom(anyAvailable);
        if (!pick) continue;
        usedInThisCat.add(pick.id);
        chosen.push({
          id: pick.id,
          text: pick.text,
          answer: pick.answer,
          image: pick.image,
          points: tier,
        });
      }

      if (chosen.length < 6) return null;
      chosen.forEach((q) => pickedIds.push(q.id));
      return {
        id: cat.id,
        name: cat.name,
        imageUrl: cat.imageUrl,
        questions: chosen,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (categoriesData.length !== 6) {
    res.status(400).json({ error: "بعض التصنيفات لا تحتوي على 6 أسئلة" });
    return;
  }

  const teamsData = teams.map((t) => ({ id: t.id, name: t.name, score: 0 }));

  // Update seen set:
  //   - Drop any IDs from exhausted categories (fresh cycle starts).
  //   - Add the freshly picked IDs.
  const nextSeenSet = new Set<number>(seenSet);
  for (const id of seenToClear) nextSeenSet.delete(id);
  for (const id of pickedIds) nextSeenSet.add(id);
  const nextSeen = Array.from(nextSeenSet);

  await db
    .update(usersTable)
    .set({
      roundsBalance: req.user!.roundsBalance - 1,
      seenQuestionIds: nextSeen,
    })
    .where(eq(usersTable.id, req.user!.id));

  const [created] = await db
    .insert(gamesTable)
    .values({
      userId: req.user!.id,
      teamsData,
      categoriesData,
      usedQuestionIds: [],
      isActive: true,
    })
    .returning();

  res.status(201).json(GetActiveGameResponse.parse(serializeGame(created)));
});

router.patch("/game/active", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateActiveGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [g] = await db
    .select()
    .from(gamesTable)
    .where(and(eq(gamesTable.userId, req.user!.id), eq(gamesTable.isActive, true)));
  if (!g) {
    res.status(404).json({ error: "no active game" });
    return;
  }
  const updates: Partial<typeof gamesTable.$inferInsert> = {};
  if (parsed.data.teams) updates.teamsData = parsed.data.teams;
  if (parsed.data.usedQuestionIds) updates.usedQuestionIds = parsed.data.usedQuestionIds;
  const [updated] = await db
    .update(gamesTable)
    .set(updates)
    .where(eq(gamesTable.id, g.id))
    .returning();
  res.json(UpdateActiveGameResponse.parse(serializeGame(updated)));
});

router.delete("/game/active", requireAuth, async (req, res): Promise<void> => {
  await db
    .update(gamesTable)
    .set({ isActive: false })
    .where(and(eq(gamesTable.userId, req.user!.id), eq(gamesTable.isActive, true)));
  res.sendStatus(204);
});

export default router;
