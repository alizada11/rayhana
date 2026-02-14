import type { Request, Response } from "express";
import * as queries from "../db/queries";

import { getAuth } from "../lib/auth";

const toSafeUser = (user: any) => {
  // strip sensitive fields if present
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user || {};
  return rest;
};

export async function syncUser(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { email, name, imageUrl } = req.body;

    if (!email || !name || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Email, name, and imageUrl are required" });
    }

    const user = await queries.upsertUser({
      id: userId,
      email,
      name,
      imageUrl,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await queries.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ id: user.id, role: user.role, email: user.email });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const { search, role, cursor } = req.query;
    const limitParam = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(limitParam, 1), 100);
    const roleFilter =
      role === "admin" || role === "guest" ? (role as "admin" | "guest") : undefined;

    const result = await queries.listUsersWithStats({
      search: typeof search === "string" ? search : undefined,
      role: roleFilter,
      cursorId: typeof cursor === "string" ? cursor : null,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Failed to list users" });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await queries.getUserWithStats(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

export async function updateUserAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name && !email && !role) {
      return res.status(400).json({ error: "No changes provided" });
    }

    if (role && role !== "admin" && role !== "guest") {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existing = await queries.getUserById(id);
    if (!existing) return res.status(404).json({ error: "User not found" });

    const payload: any = {};
    if (typeof name === "string" && name.trim()) payload.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailOwner = await queries.getUserByEmail(normalizedEmail);
      if (emailOwner && emailOwner.id !== id) {
        return res.status(409).json({ error: "Email already in use" });
      }
      payload.email = normalizedEmail;
    }

    if (role) {
      if (existing.role === "admin" && role === "guest") {
        const adminCount = await queries.countAdmins();
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({ error: "At least one admin account must remain" });
        }
      }
      payload.role = role;
    }

    const updated = await queries.updateUser(id, payload);
    const withStats = await queries.getUserWithStats(id);
    res.status(200).json(withStats ?? toSafeUser(updated));
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUserAdmin(req: Request, res: Response) {
  try {
    const { userId: currentUserId } = getAuth(req);
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (id === currentUserId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own administrator account" });
    }

    const user = await queries.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin") {
      const adminCount = await queries.countAdmins();
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ error: "Cannot delete the last remaining admin" });
      }
    }

    const stats = await queries.getUserWithStats(id);
    const deleted = await queries.deleteUserWithCleanup(id);

    res.status(200).json({ deletedId: deleted.id, impact: stats });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}
