import type { Request, Response } from "express";
import { z } from "zod";
import { getAuth } from "../lib/auth";
import * as queries from "../db/queries";
import { ENV } from "../config/env";
import { sendContactEmail } from "../utils/mailer";

const predictionSchema = z.object({
  fullName: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(320),
  country: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "Selected country is not valid"),
  franceSpainAdvances: z.enum(["FRANCE", "SPAIN"]).nullable(),
  franceSpainFranceScore: z.number().int().min(0).max(20).nullable(),
  franceSpainSpainScore: z.number().int().min(0).max(20).nullable(),
  englandArgentinaAdvances: z.enum(["ENGLAND", "ARGENTINA"]),
  englandArgentinaEnglandScore: z.number().int().min(0).max(20),
  englandArgentinaArgentinaScore: z.number().int().min(0).max(20),
  termsAccepted: z.literal(true),
});

const winnerStatusSchema = z.enum([
  "PENDING",
  "FIRST",
  "SECOND",
  "THIRD",
  "DISCOUNT",
  "NOT_WINNER",
]);
const finalStatusSchema = z.enum([
  "COMING_SOON",
  "OPEN",
  "CLOSED",
  "RESULTS",
]);
const finalChampionSchema = z.enum(["TEAM_A", "TEAM_B"]);
const lotteryCriterionSchema = z.enum([
  "ALL_VALID",
  "CORRECT_ONLY",
  "NON_PRIZE",
]);

function isMissingWorldCupTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "42P01"
  );
}

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const campaignFromEmail =
  ENV.SMTP_FROM_EMAIL || ENV.SMTP_USER || "no-reply@rayhana.com";

async function sendReferenceCodeEmail(prediction: {
  fullName: string;
  email: string;
  referenceCode: string;
}) {
  await sendContactEmail({
    to: prediction.email,
    from: campaignFromEmail,
    subject: "Your Rayhana World Cup reference code",
    html: `
      <p>Hello ${escapeHtml(prediction.fullName)},</p>
      <p>Your Rayhana World Cup final-stage reference code is:</p>
      <p style="font-size:24px;font-weight:800;letter-spacing:3px;">${escapeHtml(prediction.referenceCode)}</p>
      <p>Use this code with your registered email to submit your final prediction.</p>
    `,
  });
}

async function sendLotteryWinnerEmail(winner: {
  position: number;
  fullName: string;
  email: string;
}) {
  await sendContactEmail({
    to: winner.email,
    from: campaignFromEmail,
    subject: "You won in the Rayhana World Cup campaign",
    html: `
      <p>Hello ${escapeHtml(winner.fullName)},</p>
      <p>Congratulations. Your entry was selected in the Rayhana World Cup campaign draw.</p>
      <p><strong>Winner position:</strong> #${escapeHtml(winner.position)}</p>
      <p>Our team will contact you with prize and verification details.</p>
    `,
  });
}

export const status = async (_req: Request, res: Response) => {
  const now = Date.now();
  res.json({
    firstMatchDeadline: queries.WORLD_CUP_FIRST_MATCH_DEADLINE.getTime(),
    deadline: queries.WORLD_CUP_CAMPAIGN_DEADLINE.getTime(),
    isFirstMatchOpen: now < queries.WORLD_CUP_FIRST_MATCH_DEADLINE.getTime(),
    isOpen: now < queries.WORLD_CUP_CAMPAIGN_DEADLINE.getTime(),
  });
};

export const liveStats = async (_req: Request, res: Response) => {
  let choices: Awaited<ReturnType<typeof queries.listWorldCupPredictionChoices>>;
  try {
    choices = await queries.listWorldCupPredictionChoices();
  } catch (error) {
    if (!isMissingWorldCupTable(error)) throw error;
    console.warn(
      "[world-cup-campaign] tables are missing; returning empty live stats"
    );
    choices = [];
  }
  const totalPredictions = choices.length;
  const firstMatchChoices = choices.filter(item => item.franceSpainAdvances);
  const secondMatchChoices = choices.filter(item => item.englandArgentinaAdvances);
  const percentage = (count: number, total: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);
  const france = firstMatchChoices.filter(
    item => item.franceSpainAdvances === "FRANCE"
  ).length;
  const spain = firstMatchChoices.filter(
    item => item.franceSpainAdvances === "SPAIN"
  ).length;
  const england = choices.filter(
    item => item.englandArgentinaAdvances === "ENGLAND"
  ).length;
  const argentina = secondMatchChoices.filter(
    item => item.englandArgentinaAdvances === "ARGENTINA"
  ).length;

  res.json({
    totalPredictions,
    matchups: [
      {
        id: "france-spain",
        teams: [
          { code: "FRANCE", label: "فرانسه", count: france, percentage: percentage(france, firstMatchChoices.length) },
          { code: "SPAIN", label: "اسپانیا", count: spain, percentage: percentage(spain, firstMatchChoices.length) },
        ],
      },
      {
        id: "england-argentina",
        teams: [
          { code: "ENGLAND", label: "انگلستان", count: england, percentage: percentage(england, secondMatchChoices.length) },
          { code: "ARGENTINA", label: "آرژانتین", count: argentina, percentage: percentage(argentina, secondMatchChoices.length) },
        ],
      },
    ],
  });
};

export const submit = async (req: Request, res: Response) => {
  const parsed = predictionSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  if (Date.now() >= queries.WORLD_CUP_CAMPAIGN_DEADLINE.getTime()) {
    return res.status(403).json({ error: "مهلت ثبت پیش‌بینی پایان یافته است." });
  }
  const firstMatchClosed =
    Date.now() >= queries.WORLD_CUP_FIRST_MATCH_DEADLINE.getTime();
  if (firstMatchClosed) {
    if (
      parsed.data.franceSpainAdvances !== null ||
      parsed.data.franceSpainFranceScore !== null ||
      parsed.data.franceSpainSpainScore !== null
    ) {
      return res
        .status(403)
        .json({ error: "مهلت ثبت پیش‌بینی نیمه‌نهایی اول پایان یافته است." });
    }
  } else if (
    parsed.data.franceSpainAdvances === null ||
    parsed.data.franceSpainFranceScore === null ||
    parsed.data.franceSpainSpainScore === null
  ) {
    return res.status(400).json({
      error: "پیش‌بینی نیمه‌نهایی اول کامل نیست.",
    });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await queries.getWorldCupPredictionByEmail(email);
  if (existing) {
    return res
      .status(409)
      .json({ error: "با این ایمیل قبلاً یک پیش‌بینی ثبت شده است." });
  }

  try {
    const created = await queries.createWorldCupPrediction({
      fullName: parsed.data.fullName,
      email,
      country: parsed.data.country,
      franceSpainAdvances: parsed.data.franceSpainAdvances,
      franceSpainFranceScore: parsed.data.franceSpainFranceScore,
      franceSpainSpainScore: parsed.data.franceSpainSpainScore,
      englandArgentinaAdvances: parsed.data.englandArgentinaAdvances,
      englandArgentinaEnglandScore: parsed.data.englandArgentinaEnglandScore,
      englandArgentinaArgentinaScore:
        parsed.data.englandArgentinaArgentinaScore,
      acceptedTermsAt: new Date(),
    });

    res.status(201).json({
      success: true,
      registrationId: created.id,
      referenceCode: queries.makeWorldCupPredictionReferenceCode(created),
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res
        .status(409)
        .json({ error: "با این ایمیل قبلاً یک پیش‌بینی ثبت شده است." });
    }
    throw error;
  }
};

export const finalStage = async (_req: Request, res: Response) => {
  let settings: Awaited<ReturnType<typeof queries.getWorldCupCampaignSettings>>;
  try {
    settings = await queries.getWorldCupCampaignSettings();
  } catch (error) {
    if (!isMissingWorldCupTable(error)) throw error;
    console.warn(
      "[world-cup-campaign] tables are missing; returning default final stage"
    );
    settings = undefined;
  }
  res.json({
    teamA: settings?.finalTeamA ?? null,
    teamB: settings?.finalTeamB ?? null,
    deadline: settings?.finalDeadline?.getTime() ?? null,
    status: settings?.finalStatus ?? "COMING_SOON",
    result:
      settings?.finalStatus === "RESULTS"
        ? {
            teamAScore: settings.finalResultAScore,
            teamBScore: settings.finalResultBScore,
            champion: settings.finalChampion,
          }
        : null,
  });
};

export const submitFinal = async (req: Request, res: Response) => {
  const parsed = z
    .object({
      email: z.string().trim().email().max(320),
      referenceCode: z.string().trim().length(10),
      teamAScore: z.number().int().min(0).max(30),
      teamBScore: z.number().int().min(0).max(30),
      champion: finalChampionSchema,
    })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  if (parsed.data.teamAScore === parsed.data.teamBScore) {
    return res.status(400).json({ error: "نتیجه مساوی پذیرفته نیست." });
  }

  try {
    const result = await queries.submitWorldCupFinalPrediction({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
    });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FINAL_NOT_OPEN" || message === "FINAL_CLOSED") {
      return res
        .status(403)
        .json({ error: "ثبت پیش‌بینی فینال اکنون باز نیست." });
    }
    if (message === "INVALID_REFERENCE") {
      return res.status(401).json({ error: "ایمیل یا کد مرجع درست نیست." });
    }
    throw error;
  }
};

export const recoverReferenceCode = async (req: Request, res: Response) => {
  const parsed = z
    .object({ email: z.string().trim().email().max(320) })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }

  const email = parsed.data.email.toLowerCase();
  const prediction = await queries.getWorldCupPredictionByEmail(email);
  if (prediction) {
    await sendReferenceCodeEmail({
      fullName: prediction.fullName,
      email: prediction.email,
      referenceCode: queries.makeWorldCupPredictionReferenceCode(prediction),
    });
  }

  res.json({ success: true });
};

export const publicLotteryWinners = async (_req: Request, res: Response) => {
  try {
    res.json(await queries.getPublicWorldCupLotteryWinners());
  } catch (error) {
    if (!isMissingWorldCupTable(error)) throw error;
    console.warn(
      "[world-cup-campaign] tables are missing; returning empty public winners"
    );
    res.json([]);
  }
};

export const adminList = async (_req: Request, res: Response) => {
  const rows = await queries.listWorldCupPredictions();
  res.json(
    rows.map(item => ({
      ...item,
      referenceCode: queries.makeWorldCupPredictionReferenceCode(item),
    }))
  );
};

export const updateWinnerStatus = async (req: Request, res: Response) => {
  const parsed = z
    .object({ winnerStatus: winnerStatusSchema })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  const updated = await queries.updateWorldCupPredictionWinnerStatus(
    req.params.id,
    parsed.data.winnerStatus
  );
  if (!updated) return res.status(404).json({ error: "Prediction not found" });
  res.json(updated);
};

export const deleteAllPredictions = async (req: Request, res: Response) => {
  const parsed = z
    .object({ confirmation: z.literal("I'm sure") })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Type exactly "I\'m sure" to delete all predictions.',
    });
  }

  const result = await queries.deleteAllWorldCupPredictions();
  res.json(result);
};

export const adminFinalSettings = async (_req: Request, res: Response) => {
  res.json(await queries.getWorldCupCampaignSettings());
};

export const adminFinalPredictions = async (_req: Request, res: Response) => {
  res.json(await queries.listWorldCupFinalPredictions());
};

export const updateFinalSettings = async (req: Request, res: Response) => {
  const parsed = z
    .object({
      finalTeamA: z.string().trim().max(120).nullable(),
      finalTeamB: z.string().trim().max(120).nullable(),
      finalDeadline: z.number().int().positive().nullable(),
      finalStatus: finalStatusSchema,
      semiFinalFranceScore: z.number().int().min(0).max(20).nullable(),
      semiFinalSpainScore: z.number().int().min(0).max(20).nullable(),
      semiFinalEnglandScore: z.number().int().min(0).max(20).nullable(),
      semiFinalArgentinaScore: z.number().int().min(0).max(20).nullable(),
      finalResultAScore: z.number().int().min(0).max(30).nullable(),
      finalResultBScore: z.number().int().min(0).max(30).nullable(),
      finalChampion: finalChampionSchema.nullable(),
      publicWinnersVisible: z.boolean(),
    })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }

  const input = parsed.data;
  if (input.finalStatus !== "COMING_SOON" && (!input.finalTeamA || !input.finalTeamB)) {
    return res
      .status(400)
      .json({ error: "برای فعال‌سازی مرحله فینال، نام هر دو تیم لازم است." });
  }
  if (
    input.finalStatus === "OPEN" &&
    (!input.finalDeadline || input.finalDeadline <= Date.now())
  ) {
    return res
      .status(400)
      .json({ error: "مهلت مرحله باز باید در آینده باشد." });
  }
  if (
    input.finalStatus === "RESULTS" &&
    (input.semiFinalFranceScore == null ||
      input.semiFinalSpainScore == null ||
      input.semiFinalEnglandScore == null ||
      input.semiFinalArgentinaScore == null ||
      input.finalResultAScore == null ||
      input.finalResultBScore == null ||
      !input.finalChampion)
  ) {
    return res.status(400).json({
      error: "برای نمایش نتایج، امتیاز نیمه‌نهایی‌ها، امتیاز فینال و قهرمان را ثبت کنید.",
    });
  }
  if (
    input.finalStatus === "RESULTS" &&
    input.finalResultAScore === input.finalResultBScore
  ) {
    return res.status(400).json({
      error: "نتیجه فینال نمی‌تواند مساوی باشد.",
    });
  }

  const { userId } = getAuth(req);
  const settings = await queries.saveWorldCupCampaignSettings({
    ...input,
    finalDeadline: input.finalDeadline ? new Date(input.finalDeadline) : null,
    updatedBy: userId || null,
  });
  res.json(settings);
};

export const lotteryEligibility = async (req: Request, res: Response) => {
  const parsed = z
    .object({ criterion: lotteryCriterionSchema })
    .safeParse(req.query || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  const pool = await queries.getWorldCupEligibleLotteryPool(
    parsed.data.criterion
  );
  res.json({ count: pool.length });
};

export const executeLottery = async (req: Request, res: Response) => {
  const parsed = z
    .object({
      criterion: lotteryCriterionSchema,
      winnerCount: z.number().int().min(1).max(100),
      confirmation: z.literal("اجرای قطعی"),
    })
    .safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await queries.executeWorldCupLotteryDraw({
      criterion: parsed.data.criterion,
      winnerCount: parsed.data.winnerCount,
      executedBy: userId,
    });
    const draws = await queries.listWorldCupLotteryDraws();
    const draw = draws.find(item => item.id === result.drawId);
    const emailResults = await Promise.allSettled(
      (draw?.winners ?? []).map(winner => sendLotteryWinnerEmail(winner))
    );
    const winnerEmailCount = emailResults.filter(
      item => item.status === "fulfilled"
    ).length;
    res.status(201).json({ ...result, winnerEmailCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NO_ELIGIBLE_PARTICIPANTS") {
      return res.status(400).json({
        error: "برای این معیار هنوز شرکت‌کننده واجد شرایط وجود ندارد.",
      });
    }
    if (message === "WINNER_COUNT_TOO_HIGH") {
      return res
        .status(400)
        .json({ error: "تعداد برندگان از شمار واجدان شرایط بیشتر است." });
    }
    throw error;
  }
};

export const adminLotteryDraws = async (_req: Request, res: Response) => {
  res.json(await queries.listWorldCupLotteryDraws());
};

export const publishLottery = async (req: Request, res: Response) => {
  const parsed = z.object({ published: z.boolean() }).safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  const draw = await queries.publishWorldCupLotteryDraw(
    req.params.id,
    parsed.data.published
  );
  if (!draw) return res.status(404).json({ error: "Draw not found" });
  res.json(draw);
};
