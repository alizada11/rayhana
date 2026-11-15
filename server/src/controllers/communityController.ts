import type { Request, Response } from "express";
import { z } from "zod";
import { count } from "drizzle-orm";
import { db } from "../db";
import { anonymousCommunityResponses } from "../db/schema";

const anonymousResponseSchema = z.object({
  responseId: z.string().uuid(),
  memory: z.enum(["qabili", "rice", "other", "skip"]),
  safety: z.literal(true),
  recipe: z.enum(["qabili", "rice", "suggestion"]),
  vote: z.enum(["yes", "no", "unsure"]),
  pattern: z.enum(["simple", "carpet"]).nullable(),
});

export async function submitAnonymousResponse(req: Request, res: Response) {
  const parsed = anonymousResponseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Survey answers are invalid." });
  }

  const { responseId, memory, safety, recipe, vote, pattern } = parsed.data;
  await db
    .insert(anonymousCommunityResponses)
    .values({
      id: responseId,
      memory,
      safety,
      recipe,
      vote,
      pattern,
    })
    .onConflictDoNothing({ target: anonymousCommunityResponses.id });

  return res.status(201).json({ success: true });
}

export async function adminSummary(_req: Request, res: Response) {
  const [totalRows, memory, recipe, vote, pattern] = await Promise.all([
    db.select({ count: count() }).from(anonymousCommunityResponses),
    db
      .select({ answer: anonymousCommunityResponses.memory, count: count() })
      .from(anonymousCommunityResponses)
      .groupBy(anonymousCommunityResponses.memory),
    db
      .select({ answer: anonymousCommunityResponses.recipe, count: count() })
      .from(anonymousCommunityResponses)
      .groupBy(anonymousCommunityResponses.recipe),
    db
      .select({ answer: anonymousCommunityResponses.vote, count: count() })
      .from(anonymousCommunityResponses)
      .groupBy(anonymousCommunityResponses.vote),
    db
      .select({ answer: anonymousCommunityResponses.pattern, count: count() })
      .from(anonymousCommunityResponses)
      .groupBy(anonymousCommunityResponses.pattern),
  ]);

  return res.json({
    total: totalRows[0]?.count ?? 0,
    memory,
    recipe,
    vote,
    pattern: pattern.map(row => ({ answer: row.answer ?? "none", count: row.count })),
  });
}
