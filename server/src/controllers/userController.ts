import type { Request, Response } from "express";
import * as queries from "../db/queries";

import { getAuth, hashPassword, verifyPassword } from "../lib/auth";

const sendError = (
  res: Response,
  status: number,
  errorKey: string,
  fallback: string
) => res.status(status).json({ error: fallback, errorKey });

const toSafeUser = (user: any) => {
  // strip sensitive fields if present
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user || {};
  return rest;
};

export async function getMyProfile(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const user = await queries.getUserWithStats(userId);
    if (!user) return sendError(res, 404, "user.not_found", "User not found");
    if (user.role !== "guest") {
      return sendError(
        res,
        403,
        "profile.guests_only",
        "Only guest accounts can use profile endpoints"
      );
    }

    return res.status(200).json(toSafeUser(user));
  } catch (error) {
    console.error("Error fetching profile:", error);
    return sendError(res, 500, "profile.failed_load", "Failed to load profile");
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const existing = await queries.getUserById(userId);
    if (!existing)
      return sendError(res, 404, "user.not_found", "User not found");
    if (existing.role !== "guest") {
      return sendError(
        res,
        403,
        "profile.guests_only",
        "Only guest accounts can update profile here"
      );
    }

    const { name, email, imageUrl } = req.body || {};
    if (!name && !email && !imageUrl) {
      return sendError(res, 400, "profile.no_changes", "No changes provided");
    }

    const payload: any = {};
    if (typeof name === "string" && name.trim()) payload.name = name.trim();
    if (typeof imageUrl === "string" && imageUrl.trim())
      payload.imageUrl = imageUrl.trim();

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const owner = await queries.getUserByEmail(normalizedEmail);
      if (owner && owner.id !== userId) {
        return sendError(
          res,
          409,
          "profile.email_in_use",
          "Email already in use"
        );
      }
      payload.email = normalizedEmail;
    }

    const updated = await queries.updateUser(userId, payload);
    const withStats = await queries.getUserWithStats(userId);
    return res
      .status(200)
      .json(withStats ? toSafeUser(withStats) : toSafeUser(updated));
  } catch (error) {
    console.error("Error updating profile:", error);
    return sendError(
      res,
      500,
      "profile.failed_update",
      "Failed to update profile"
    );
  }
}

export async function changeMyPassword(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const user = await queries.getUserById(userId);
    if (!user) return sendError(res, 404, "user.not_found", "User not found");
    if (user.role !== "guest") {
      return sendError(
        res,
        403,
        "profile.guests_only",
        "Only guest accounts can change password here"
      );
    }

    const { currentPassword, newPassword } = req.body || {};
    if (typeof newPassword !== "string") {
      return sendError(
        res,
        400,
        "profile.new_password_required",
        "newPassword is required"
      );
    }
    if (newPassword.length < 8) {
      return sendError(
        res,
        400,
        "profile.password_too_short",
        "Password must be at least 8 characters"
      );
    }
    if (newPassword.length > 128) {
      return sendError(
        res,
        400,
        "profile.password_too_long",
        "Password must not exceed 128 characters"
      );
    }

    // If password not set yet, allow creation without currentPassword
    if (user.passwordHash) {
      if (!currentPassword) {
        return sendError(
          res,
          400,
          "profile.current_password_required",
          "currentPassword is required"
        );
      }
      const ok = await verifyPassword(user.passwordHash, currentPassword);
      if (!ok)
        return sendError(
          res,
          401,
          "profile.current_password_incorrect",
          "Current password is incorrect"
        );
    }

    const passwordHash = await hashPassword(newPassword);
    await queries.updateUser(userId, { passwordHash });
    await queries.revokeSessionsByUserId(userId);

    const messageKey = user.passwordHash
      ? "profile.password_updated"
      : "profile.password_created";
    const message =
      messageKey === "profile.password_updated"
        ? "Password updated. Please sign in again."
        : "Password created. Please sign in again.";

    return res.status(200).json({ success: true, message, messageKey });
  } catch (error) {
    console.error("Error changing password:", error);
    return sendError(
      res,
      500,
      "profile.failed_change_password",
      "Failed to change password"
    );
  }
}

export async function syncUser(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const { email, name, imageUrl } = req.body;

    if (!email || !name || !imageUrl) {
      return sendError(
        res,
        400,
        "profile.sync_missing_fields",
        "Email, name, and imageUrl are required"
      );
    }

    const user = await queries.upsertUser({
      id: userId,
      email,
      name,
      imageUrl,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return sendError(res, 500, "profile.sync_failed", "Failed to sync user");
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const user = await queries.getUserById(userId);
    if (!user) return sendError(res, 404, "user.not_found", "User not found");

    return res
      .status(200)
      .json({ id: user.id, role: user.role, email: user.email });
  } catch (error) {
    console.error("Error getting user:", error);
    return sendError(res, 500, "user.failed_get", "Failed to get user");
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const { search, role, cursor } = req.query;
    const limitParam = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(limitParam, 1), 100);
    const roleFilter =
      role === "admin" || role === "guest"
        ? (role as "admin" | "guest")
        : undefined;

    const result = await queries.listUsersWithStats({
      search: typeof search === "string" ? search : undefined,
      role: roleFilter,
      cursorId: typeof cursor === "string" ? cursor : null,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error listing users:", error);
    return sendError(res, 500, "user.failed_list", "Failed to list users");
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await queries.getUserWithStats(id);
    if (!user) return sendError(res, 404, "user.not_found", "User not found");
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return sendError(res, 500, "user.failed_get", "Failed to get user");
  }
}

export async function updateUserAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name && !email && !role) {
      return sendError(res, 400, "user.no_changes", "No changes provided");
    }

    if (role && role !== "admin" && role !== "guest") {
      return sendError(res, 400, "user.invalid_role", "Invalid role");
    }

    const existing = await queries.getUserById(id);
    if (!existing)
      return sendError(res, 404, "user.not_found", "User not found");

    const payload: any = {};
    if (typeof name === "string" && name.trim()) payload.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailOwner = await queries.getUserByEmail(normalizedEmail);
      if (emailOwner && emailOwner.id !== id) {
        return sendError(res, 409, "user.email_in_use", "Email already in use");
      }
      payload.email = normalizedEmail;
    }

    if (role) {
      if (existing.role === "admin" && role === "guest") {
        const adminCount = await queries.countAdmins();
        if (adminCount <= 1) {
          return sendError(
            res,
            400,
            "user.last_admin",
            "At least one admin account must remain"
          );
        }
      }
      payload.role = role;
    }
    if (Object.keys(payload).length === 0) {
      return sendError(res, 400, "profile.no_changes", "No changes provided");
    }
    const updated = await queries.updateUser(id, payload);
    const withStats = await queries.getUserWithStats(id);
    return res.status(200).json(withStats ?? toSafeUser(updated));
  } catch (error) {
    console.error("Error updating user:", error);
    return sendError(res, 500, "user.failed_update", "Failed to update user");
  }
}

export async function deleteUserAdmin(req: Request, res: Response) {
  try {
    const { userId: currentUserId } = getAuth(req);
    if (!currentUserId)
      return sendError(res, 401, "auth.unauthorized", "Unauthorized");

    const { id } = req.params;
    if (id === currentUserId) {
      return sendError(
        res,
        400,
        "user.cannot_delete_self_admin",
        "You cannot delete your own administrator account"
      );
    }

    const user = await queries.getUserById(id);
    if (!user) return sendError(res, 404, "user.not_found", "User not found");

    if (user.role === "admin") {
      const adminCount = await queries.countAdmins();
      if (adminCount <= 1) {
        return sendError(
          res,
          400,
          "user.last_admin_delete",
          "Cannot delete the last remaining admin"
        );
      }
    }

    const stats = await queries.getUserWithStats(id);
    const deleted = await queries.deleteUserWithCleanup(id);

    return res.status(200).json({ deletedId: deleted.id, impact: stats });
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendError(res, 500, "user.failed_delete", "Failed to delete user");
  }
}
