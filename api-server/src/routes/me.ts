import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const u = req.user!;
  res.json(GetMeResponse.parse({
    id: u.id,
    email: u.email,
    name: u.name,
    isAdmin: u.isAdmin,
    roundsBalance: u.roundsBalance,
  }));
});

export default router;
