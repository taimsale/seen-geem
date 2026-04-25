import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, promoCodesTable, codeRedemptionsTable, usersTable } from "@workspace/db";
import { RedeemCodeBody, RedeemCodeResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/codes/redeem", requireAuth, async (req, res): Promise<void> => {
  const parsed = RedeemCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const codeStr = parsed.data.code.trim().toUpperCase();
  if (!codeStr) {
    res.status(400).json({ error: "الكود مطلوب" });
    return;
  }

  const [promo] = await db.select().from(promoCodesTable).where(eq(promoCodesTable.code, codeStr));
  if (!promo) {
    res.status(404).json({ error: "كود غير صحيح" });
    return;
  }
  if (promo.usedCount >= promo.maxUses) {
    res.status(409).json({ error: "تم استنفاد هذا الكود" });
    return;
  }

  const [existing] = await db
    .select()
    .from(codeRedemptionsTable)
    .where(eq(codeRedemptionsTable.codeId, promo.id));
  const userAlready = await db
    .select()
    .from(codeRedemptionsTable)
    .where(eq(codeRedemptionsTable.userId, req.user!.id));
  if (userAlready.some((r) => r.codeId === promo.id)) {
    res.status(409).json({ error: "لقد استخدمت هذا الكود من قبل" });
    return;
  }

  await db.insert(codeRedemptionsTable).values({ codeId: promo.id, userId: req.user!.id });
  await db
    .update(promoCodesTable)
    .set({ usedCount: promo.usedCount + 1 })
    .where(eq(promoCodesTable.id, promo.id));
  const newBalance = req.user!.roundsBalance + promo.roundsValue;
  await db.update(usersTable).set({ roundsBalance: newBalance }).where(eq(usersTable.id, req.user!.id));

  void existing;
  res.json(
    RedeemCodeResponse.parse({
      roundsAdded: promo.roundsValue,
      newBalance,
      message: `تم إضافة ${promo.roundsValue} جولة لرصيدك`,
    }),
  );
});

export default router;
