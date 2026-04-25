import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Single hard-coded admin. No env override, no first-user fallback.
const SOLE_ADMIN_EMAIL = "swrymbd@gmail.com";

function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === SOLE_ADMIN_EMAIL;
}

export async function syncUser(userId: string): Promise<User> {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  let clerkUser;
  try {
    clerkUser = await clerkClient.users.getUser(userId);
  } catch {
    clerkUser = null;
  }
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || email || "مستخدم";
  const shouldBeAdmin = isAdminEmail(email);

  if (!existing) {
    const [created] = await db
      .insert(usersTable)
      .values({ id: userId, email, name, isAdmin: shouldBeAdmin, roundsBalance: shouldBeAdmin ? 99 : 1 })
      .returning();
    return created;
  }

  const updates: Partial<User> = {};
  if (email && email !== existing.email) updates.email = email;
  if (name && name !== existing.name) updates.name = name;
  // Enforce: only the sole admin email is admin; demote everyone else.
  if (existing.isAdmin !== shouldBeAdmin) updates.isAdmin = shouldBeAdmin;
  if (Object.keys(updates).length > 0) {
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    return updated;
  }
  return existing;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  syncUser(auth.userId)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      req.log.error({ err }, "syncUser failed");
      res.status(500).json({ error: "auth sync failed" });
    });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  next();
}
