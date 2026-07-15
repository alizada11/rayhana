import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteAllWorldCupPredictionsAdmin,
  useExecuteWorldCupLotteryAdmin,
  usePublishWorldCupLotteryAdmin,
  useUpdateWorldCupFinalSettingsAdmin,
  useUpdateWorldCupWinnerStatusAdmin,
  useWorldCupFinalPredictionsAdmin,
  useWorldCupFinalSettingsAdmin,
  useWorldCupLotteryDrawsAdmin,
  useWorldCupLotteryEligibilityAdmin,
  useWorldCupPredictionsAdmin,
  useWorldCupStatus,
} from "@/hooks/useWorldCupCampaign";
import type {
  WorldCupFinalChampion,
  WorldCupFinalStatus,
  WorldCupLotteryCriterion,
  WorldCupWinnerStatus,
} from "@/lib/api";
import { getCountryLabel } from "@shared/countries";
import {
  AlertTriangle,
  Download,
  Gift,
  Search,
  Settings2,
  ShieldCheck,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const teamLabels = {
  FRANCE: "فرانسه",
  SPAIN: "اسپانیا",
  ENGLAND: "انگلستان",
  ARGENTINA: "آرژانتین",
} as const;

type TeamCode = keyof typeof teamLabels;

const teamOptions = Object.entries(teamLabels).map(([code, label]) => ({
  code: code as TeamCode,
  label,
}));

const getTeamCodeFromLabel = (value: string) =>
  teamOptions.find(option => option.label === value || option.code === value)
    ?.code ?? null;

const getTeamSemiFinal = (value: string) => {
  const team = getTeamCodeFromLabel(value);
  if (team === "FRANCE" || team === "SPAIN") return "first";
  if (team === "ENGLAND" || team === "ARGENTINA") return "second";
  return null;
};

type ScoreLineVariant = "success" | "danger" | "neutral";

const scoreLineClasses: Record<ScoreLineVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  danger: "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15",
  neutral: "border-border bg-muted text-foreground",
};

function ScoreLine({
  team,
  score,
  variant,
}: {
  team: string;
  score: number | null;
  variant: ScoreLineVariant;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border px-2 py-1 ${scoreLineClasses[variant]}`}
    >
      <span>{team}</span>
      <strong dir="ltr">{score ?? "—"}</strong>
    </div>
  );
}

function MatchScore<T extends string>({
  firstTeam,
  firstLabel,
  firstScore,
  secondTeam,
  secondLabel,
  secondScore,
  winnerTeam,
}: {
  firstTeam: T;
  firstLabel: string;
  firstScore: number | null;
  secondTeam: T;
  secondLabel: string;
  secondScore: number | null;
  winnerTeam?: T | null;
}) {
  const firstVariant = winnerTeam
    ? firstTeam === winnerTeam
      ? "success"
      : "danger"
    : "neutral";
  const secondVariant = winnerTeam
    ? secondTeam === winnerTeam
      ? "success"
      : "danger"
    : "neutral";

  return (
    <div className="min-w-32 space-y-1 text-sm">
      <ScoreLine team={firstLabel} score={firstScore} variant={firstVariant} />
      <ScoreLine
        team={secondLabel}
        score={secondScore}
        variant={secondVariant}
      />
    </div>
  );
}

const winnerLabels: Record<WorldCupWinnerStatus, string> = {
  PENDING: "در انتظار",
  FIRST: "رتبه اول",
  SECOND: "رتبه دوم",
  THIRD: "رتبه سوم",
  DISCOUNT: "کد تخفیف ۲۶٪",
  NOT_WINNER: "برنده نیست",
};

const finalStatusLabels: Record<WorldCupFinalStatus, string> = {
  COMING_SOON: "به‌زودی",
  OPEN: "باز برای ثبت",
  CLOSED: "بسته",
  RESULTS: "نمایش نتیجه",
};

const criterionLabels: Record<WorldCupLotteryCriterion, string> = {
  ALL_VALID: "همه ثبت‌های معتبر",
  NON_PRIZE: "افراد بدون جایزه اصلی",
  CORRECT_ONLY: "امتیازهای دقیق نیمه‌نهایی و فینال",
};

const formatDate = (value?: string | number | null) =>
  value
    ? new Intl.DateTimeFormat("fa-AF-u-ca-gregory", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const toLocalDateTimeInput = (value?: string | number | null) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const downloadCsv = (
  filename: string,
  rows: Array<Array<string | number | null>>
) => {
  const csv =
    "\uFEFF" +
    rows
      .map(row =>
        row
          .map(cell => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function DashboardWorldCupCampaign() {
  const [search, setSearch] = useState("");
  const [finalTeamA, setFinalTeamA] = useState("");
  const [finalTeamB, setFinalTeamB] = useState("");
  const [finalDeadline, setFinalDeadline] = useState("");
  const [finalStatus, setFinalStatus] =
    useState<WorldCupFinalStatus>("COMING_SOON");
  const [semiFinalFranceScore, setSemiFinalFranceScore] = useState("");
  const [semiFinalSpainScore, setSemiFinalSpainScore] = useState("");
  const [semiFinalEnglandScore, setSemiFinalEnglandScore] = useState("");
  const [semiFinalArgentinaScore, setSemiFinalArgentinaScore] = useState("");
  const [finalResultAScore, setFinalResultAScore] = useState("");
  const [finalResultBScore, setFinalResultBScore] = useState("");
  const [finalChampion, setFinalChampion] = useState<
    WorldCupFinalChampion | ""
  >("");
  const [publicWinnersVisible, setPublicWinnersVisible] = useState(false);
  const [criterion, setCriterion] =
    useState<WorldCupLotteryCriterion>("ALL_VALID");
  const [drawCount, setDrawCount] = useState("1");
  const [confirmation, setConfirmation] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const status = useWorldCupStatus();
  const predictions = useWorldCupPredictionsAdmin();
  const finalSettings = useWorldCupFinalSettingsAdmin();
  const finalPredictions = useWorldCupFinalPredictionsAdmin();
  const eligibility = useWorldCupLotteryEligibilityAdmin(criterion);
  const lotteryDraws = useWorldCupLotteryDrawsAdmin();
  const updateWinner = useUpdateWorldCupWinnerStatusAdmin();
  const deleteAllPredictions = useDeleteAllWorldCupPredictionsAdmin();
  const saveFinalSettings = useUpdateWorldCupFinalSettingsAdmin();
  const executeLottery = useExecuteWorldCupLotteryAdmin();
  const publishLottery = usePublishWorldCupLotteryAdmin();

  useEffect(() => {
    const data = finalSettings.data;
    if (!data) return;
    const teamACode = getTeamCodeFromLabel(data.finalTeamA ?? "");
    const teamBCode = getTeamCodeFromLabel(data.finalTeamB ?? "");
    setFinalTeamA(teamACode ? teamLabels[teamACode] : data.finalTeamA ?? "");
    setFinalTeamB(teamBCode ? teamLabels[teamBCode] : data.finalTeamB ?? "");
    setFinalDeadline(toLocalDateTimeInput(data.finalDeadline));
    setFinalStatus(data.finalStatus);
    setSemiFinalFranceScore(
      data.semiFinalFranceScore == null ? "" : String(data.semiFinalFranceScore)
    );
    setSemiFinalSpainScore(
      data.semiFinalSpainScore == null ? "" : String(data.semiFinalSpainScore)
    );
    setSemiFinalEnglandScore(
      data.semiFinalEnglandScore == null
        ? ""
        : String(data.semiFinalEnglandScore)
    );
    setSemiFinalArgentinaScore(
      data.semiFinalArgentinaScore == null
        ? ""
        : String(data.semiFinalArgentinaScore)
    );
    setFinalResultAScore(
      data.finalResultAScore == null ? "" : String(data.finalResultAScore)
    );
    setFinalResultBScore(
      data.finalResultBScore == null ? "" : String(data.finalResultBScore)
    );
    setFinalChampion(data.finalChampion ?? "");
    setPublicWinnersVisible(data.publicWinnersVisible);
  }, [finalSettings.data]);

  const items = predictions.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      item =>
        item.fullName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
    );
  }, [items, search]);

  const winnerCount = items.filter(
    item => !["PENDING", "NOT_WINNER"].includes(item.winnerStatus)
  ).length;
  const finalChampionLabel =
    finalStatus === "RESULTS" &&
    finalResultAScore !== "" &&
    finalResultBScore !== "" &&
    Number(finalResultAScore) !== Number(finalResultBScore)
      ? Number(finalResultAScore) > Number(finalResultBScore)
        ? finalTeamA || "تیم نخست"
        : finalTeamB || "تیم دوم"
      : finalChampion === "TEAM_A"
        ? finalTeamA || "تیم نخست"
        : finalChampion === "TEAM_B"
          ? finalTeamB || "تیم دوم"
          : "ثبت نشده";
  const requestedWinnerCount = Number(drawCount);
  const lotteryEligibleCount = eligibility.data?.count ?? 0;
  const drawCountValid =
    Number.isInteger(requestedWinnerCount) && requestedWinnerCount >= 1;
  const lotteryDisabledReason = eligibility.isLoading
    ? "در حال محاسبه واجدان شرایط..."
    : !drawCountValid
      ? "تعداد برندگان معتبر نیست."
      : lotteryEligibleCount === 0
        ? "برای این معیار هنوز فرد واجد شرایط وجود ندارد."
        : requestedWinnerCount > lotteryEligibleCount
          ? "تعداد برندگان از واجدان شرایط بیشتر است."
          : confirmation !== "اجرای قطعی"
            ? "برای اجرا، عبارت تأیید را دقیق وارد کنید."
            : "";

  const exportCsv = () => {
    if (!items.length) {
      toast.info("هنوز اطلاعاتی برای دریافت وجود ندارد.");
      return;
    }
    const header = [
      "نام",
      "ایمیل",
      "تاریخ ثبت",
      "کد مرجع",
      "کشور",
      "فرانسه",
      "اسپانیا",
      "صعودکننده ۱",
      "انگلستان",
      "آرژانتین",
      "صعودکننده ۲",
      "وضعیت",
    ];
    const rows = items.map(item => [
      item.fullName,
      item.email,
      formatDate(item.createdAt),
      item.referenceCode ?? "",
      getCountryLabel(item.country),
      item.franceSpainFranceScore ?? "",
      item.franceSpainSpainScore ?? "",
      item.franceSpainAdvances ? teamLabels[item.franceSpainAdvances] : "",
      item.englandArgentinaEnglandScore,
      item.englandArgentinaArgentinaScore,
      teamLabels[item.englandArgentinaAdvances],
      winnerLabels[item.winnerStatus],
    ]);
    downloadCsv("rayhana-world-cup-predictions.csv", [header, ...rows]);
  };

  const exportFinalPredictionsCsv = () => {
    const finalItems = finalPredictions.data ?? [];
    if (!finalItems.length) {
      toast.info("هنوز پیش‌بینی فینالی برای دریافت وجود ندارد.");
      return;
    }
    const teamALabel = finalTeamA || "تیم نخست";
    const teamBLabel = finalTeamB || "تیم دوم";
    const header = [
      "نام",
      "ایمیل",
      "تاریخ ثبت",
      "تیم نخست",
      "امتیاز تیم نخست",
      "تیم دوم",
      "امتیاز تیم دوم",
      "قهرمان",
    ];
    const rows = finalItems.map(item => [
      item.fullName,
      item.email,
      formatDate(item.createdAt),
      teamALabel,
      item.teamAScore,
      teamBLabel,
      item.teamBScore,
      item.champion === "TEAM_A" ? teamALabel : teamBLabel,
    ]);
    downloadCsv("rayhana-world-cup-final-predictions.csv", [header, ...rows]);
  };

  const saveFinal = () => {
    const inferredFinalChampion =
      finalStatus === "RESULTS" &&
      finalResultAScore !== "" &&
      finalResultBScore !== "" &&
      Number(finalResultAScore) !== Number(finalResultBScore)
        ? Number(finalResultAScore) > Number(finalResultBScore)
          ? "TEAM_A"
          : "TEAM_B"
        : null;

    saveFinalSettings.mutate(
      {
        finalTeamA: finalTeamA.trim() || null,
        finalTeamB: finalTeamB.trim() || null,
        finalDeadline: finalDeadline ? new Date(finalDeadline).getTime() : null,
        finalStatus,
        semiFinalFranceScore:
          semiFinalFranceScore === "" ? null : Number(semiFinalFranceScore),
        semiFinalSpainScore:
          semiFinalSpainScore === "" ? null : Number(semiFinalSpainScore),
        semiFinalEnglandScore:
          semiFinalEnglandScore === "" ? null : Number(semiFinalEnglandScore),
        semiFinalArgentinaScore:
          semiFinalArgentinaScore === ""
            ? null
            : Number(semiFinalArgentinaScore),
        finalResultAScore:
          finalResultAScore === "" ? null : Number(finalResultAScore),
        finalResultBScore:
          finalResultBScore === "" ? null : Number(finalResultBScore),
        finalChampion: inferredFinalChampion,
        publicWinnersVisible,
      },
      {
        onSuccess: () => toast.success("تنظیمات مرحله فینال ذخیره شد."),
        onError: error => toast.error(error.message),
      }
    );
  };

  const runLottery = () => {
    if (eligibility.isLoading) {
      toast.info("در حال محاسبه واجدان شرایط...");
      return;
    }
    if (!drawCountValid) {
      toast.error("تعداد برندگان معتبر نیست.");
      return;
    }
    if (lotteryEligibleCount === 0) {
      toast.error("برای این معیار هنوز فرد واجد شرایط وجود ندارد.");
      return;
    }
    if (requestedWinnerCount > lotteryEligibleCount) {
      toast.error("تعداد برندگان از واجدان شرایط بیشتر است.");
      return;
    }
    if (confirmation !== "اجرای قطعی") {
      toast.error("برای تأیید، عبارت «اجرای قطعی» را دقیق وارد کنید.");
      return;
    }
    executeLottery.mutate(
      {
        criterion,
        winnerCount: requestedWinnerCount,
        confirmation: "اجرای قطعی",
      },
      {
        onSuccess: result => {
          toast.success(
            `قرعه‌کشی با شناسه ${result.drawId.slice(0, 8)} ثبت شد.`
          );
          setConfirmation("");
        },
        onError: error => toast.error(error.message),
      }
    );
  };

  const clearPredictions = () => {
    if (deleteConfirmation !== "I'm sure") {
      toast.error('Type exactly "I\'m sure" before deleting predictions.');
      return;
    }

    deleteAllPredictions.mutate(
      { confirmation: "I'm sure" },
      {
        onSuccess: result => {
          toast.success(`${result.deletedCount} prediction(s) deleted.`);
          setDeleteConfirmation("");
        },
        onError: error => toast.error(error.message),
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">World Cup Campaign</p>
          <h1 className="text-2xl font-serif font-bold">
            مدیریت مسابقه پیش‌بینی ریحانه
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ثبت‌ها، مرحله فینال و قرعه‌کشی را از همین بخش مدیریت کنید.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" /> دریافت CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(
          [
            ["کل شرکت‌کنندگان", items.length, Users],
            ["برندگان تعیین‌شده", winnerCount, Trophy],
            ["پیش‌بینی فینال", finalPredictions.data?.length ?? 0, ShieldCheck],
            ["قرعه‌کشی‌ها", lotteryDraws.data?.length ?? 0, Gift],
          ] as Array<[string, number, LucideIcon]>
        ).map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-lg border bg-card p-4">
            <Icon className="mb-3 h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">{label as string}</p>
            <strong className="text-2xl">{String(value)}</strong>
          </div>
        ))}
      </div>

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">شرکت‌کنندگان</TabsTrigger>
          <TabsTrigger value="final">مرحله فینال</TabsTrigger>
          <TabsTrigger value="lottery">قرعه‌کشی</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-serif font-semibold">
                  پیش‌بینی‌های نیمه‌نهایی
                </h2>
                <p className="text-sm text-muted-foreground">
                  وضعیت ثبت: {status.data?.isOpen ? "باز" : "بسته"}، مهلت{" "}
                  {formatDate(status.data?.deadline)}
                </p>
              </div>
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pr-9"
                  placeholder="جست‌وجوی نام یا ایمیل"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شرکت‌کننده</TableHead>
                    <TableHead>کشور</TableHead>
                    <TableHead>تاریخ ثبت</TableHead>
                    <TableHead>کد مرجع</TableHead>
                    <TableHead>نتیجه فرانسه / اسپانیا</TableHead>
                    <TableHead>صعود</TableHead>
                    <TableHead>نتیجه انگلستان / آرژانتین</TableHead>
                    <TableHead>صعود</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="min-w-44">
                          <strong>{item.fullName}</strong>
                          <small
                            dir="ltr"
                            className="block text-muted-foreground"
                          >
                            {item.email}
                          </small>
                        </div>
                      </TableCell>
                      <TableCell>{getCountryLabel(item.country)}</TableCell>
                      <TableCell dir="ltr" className="whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell dir="ltr">{item.referenceCode}</TableCell>
                      <TableCell>
                        <MatchScore
                          firstTeam="FRANCE"
                          firstLabel={teamLabels.FRANCE}
                          firstScore={item.franceSpainFranceScore}
                          secondTeam="SPAIN"
                          secondLabel={teamLabels.SPAIN}
                          secondScore={item.franceSpainSpainScore}
                          winnerTeam={item.franceSpainAdvances}
                        />
                      </TableCell>
                      <TableCell>
                        {item.franceSpainAdvances
                          ? teamLabels[item.franceSpainAdvances]
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <MatchScore
                          firstTeam="ENGLAND"
                          firstLabel={teamLabels.ENGLAND}
                          firstScore={item.englandArgentinaEnglandScore}
                          secondTeam="ARGENTINA"
                          secondLabel={teamLabels.ARGENTINA}
                          secondScore={item.englandArgentinaArgentinaScore}
                          winnerTeam={item.englandArgentinaAdvances}
                        />
                      </TableCell>
                      <TableCell>
                        {teamLabels[item.englandArgentinaAdvances]}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.winnerStatus}
                          onValueChange={value =>
                            updateWinner.mutate(
                              {
                                id: item.id,
                                winnerStatus: value as WorldCupWinnerStatus,
                              },
                              {
                                onError: error => toast.error(error.message),
                              }
                            )
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(winnerLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-muted-foreground"
                      >
                        هنوز موردی برای نمایش وجود ندارد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <h2 className="font-serif font-semibold text-destructive">
                    حذف همه پیش‌بینی‌ها
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    فقط ثبت‌های پیش‌بینی جام جهانی حذف می‌شوند. برای فعال شدن
                    دکمه، عبارت <strong dir="ltr">I'm sure</strong> را دقیق وارد
                    کنید.
                  </p>
                </div>
              </div>
              <div className="grid w-full gap-2 md:w-80">
                <Input
                  dir="ltr"
                  value={deleteConfirmation}
                  onChange={event => setDeleteConfirmation(event.target.value)}
                  placeholder="I'm sure"
                />
                <Button
                  variant="destructive"
                  disabled={
                    deleteConfirmation !== "I'm sure" ||
                    deleteAllPredictions.isPending
                  }
                  onClick={clearPredictions}
                >
                  {deleteAllPredictions.isPending
                    ? "در حال حذف..."
                    : "حذف همه پیش‌بینی‌ها"}
                </Button>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="final">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <section className="rounded-lg border bg-card p-5">
              <div className="mb-5 flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className="font-serif font-semibold">
                  تنظیمات مرحله فینال
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="final-team-a">تیم نخست</Label>
                  <Select
                    value={finalTeamA}
                    onValueChange={value => {
                      setFinalTeamA(value);
                      if (
                        value === finalTeamB ||
                        getTeamSemiFinal(value) === getTeamSemiFinal(finalTeamB)
                      ) {
                        setFinalTeamB("");
                      }
                    }}
                  >
                    <SelectTrigger id="final-team-a">
                      <SelectValue placeholder="تیم نخست را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(option => (
                        <SelectItem
                          key={option.code}
                          value={option.label}
                          disabled={
                            option.label === finalTeamB ||
                            Boolean(
                              finalTeamB &&
                                getTeamSemiFinal(option.label) ===
                                  getTeamSemiFinal(finalTeamB)
                            )
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="final-team-b">تیم دوم</Label>
                  <Select
                    value={finalTeamB}
                    onValueChange={value => {
                      setFinalTeamB(value);
                      if (
                        value === finalTeamA ||
                        getTeamSemiFinal(value) === getTeamSemiFinal(finalTeamA)
                      ) {
                        setFinalTeamA("");
                      }
                    }}
                  >
                    <SelectTrigger id="final-team-b">
                      <SelectValue placeholder="تیم دوم را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(option => (
                        <SelectItem
                          key={option.code}
                          value={option.label}
                          disabled={
                            option.label === finalTeamA ||
                            Boolean(
                              finalTeamA &&
                                getTeamSemiFinal(option.label) ===
                                  getTeamSemiFinal(finalTeamA)
                            )
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="final-deadline">مهلت ثبت</Label>
                  <Input
                    id="final-deadline"
                    dir="ltr"
                    type="datetime-local"
                    value={finalDeadline}
                    onChange={event => setFinalDeadline(event.target.value)}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>وضعیت عمومی</Label>
                  <Select
                    value={finalStatus}
                    onValueChange={value =>
                      setFinalStatus(value as WorldCupFinalStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(finalStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 md:col-span-2">
                  <div className="mb-3">
                    <strong className="text-sm">نتیجه واقعی نیمه‌نهایی‌ها</strong>
                    <p className="text-xs text-muted-foreground">
                      برای معیار «امتیازهای دقیق»، کاربر باید همین تعداد گل‌ها
                      را برای هر دو بازی پیش‌بینی کرده باشد.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>فرانسه</Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={semiFinalFranceScore}
                        disabled={finalStatus !== "RESULTS"}
                        onChange={event =>
                          setSemiFinalFranceScore(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>اسپانیا</Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={semiFinalSpainScore}
                        disabled={finalStatus !== "RESULTS"}
                        onChange={event =>
                          setSemiFinalSpainScore(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>انگلستان</Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={semiFinalEnglandScore}
                        disabled={finalStatus !== "RESULTS"}
                        onChange={event =>
                          setSemiFinalEnglandScore(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>آرژانتین</Label>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={semiFinalArgentinaScore}
                        disabled={finalStatus !== "RESULTS"}
                        onChange={event =>
                          setSemiFinalArgentinaScore(event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>نتیجه تیم نخست</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={finalResultAScore}
                    disabled={finalStatus !== "RESULTS"}
                    onChange={event => setFinalResultAScore(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>نتیجه تیم دوم</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={finalResultBScore}
                    disabled={finalStatus !== "RESULTS"}
                    onChange={event => setFinalResultBScore(event.target.value)}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>قهرمان</Label>
                  <div className="rounded-lg border bg-muted/60 p-3 text-sm font-semibold">
                    {finalChampionLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    قهرمان به‌صورت خودکار از روی گل‌های فینال تعیین می‌شود.
                  </p>
                </div>
              </div>
              <div className="my-5 flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <strong className="text-sm">نمایش عمومی برندگان</strong>
                  <p className="text-xs text-muted-foreground">
                    فقط قرعه‌کشی‌های منتشرشده نشان داده می‌شوند.
                  </p>
                </div>
                <Switch
                  checked={publicWinnersVisible}
                  onCheckedChange={setPublicWinnersVisible}
                />
              </div>
              <Button
                onClick={saveFinal}
                disabled={saveFinalSettings.isPending}
              >
                {saveFinalSettings.isPending
                  ? "در حال ذخیره..."
                  : "ذخیره تنظیمات"}
              </Button>
            </section>

            <section className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-serif font-semibold">پیش‌بینی‌های فینال</h2>
                <div className="flex items-center gap-2">
                  <Badge>{finalPredictions.data?.length ?? 0}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportFinalPredictionsCsv}
                  >
                    <Download className="h-4 w-4" /> دریافت CSV فینال
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                {(finalPredictions.data ?? []).map(item => (
                  <div
                    key={item.id}
                    className="rounded-lg bg-muted p-3 text-sm"
                  >
                    <strong>{item.fullName}</strong>
                    <span className="mx-2 text-muted-foreground" dir="ltr">
                      {item.email}
                    </span>
                    <div className="mt-3">
                      <MatchScore
                        firstTeam="TEAM_A"
                        firstLabel={finalTeamA || "تیم نخست"}
                        firstScore={item.teamAScore}
                        secondTeam="TEAM_B"
                        secondLabel={finalTeamB || "تیم دوم"}
                        secondScore={item.teamBScore}
                        winnerTeam={item.champion}
                      />
                    </div>
                  </div>
                ))}
                {!finalPredictions.data?.length && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    هنوز پیش‌بینی فینالی ثبت نشده است.
                  </p>
                )}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="lottery">
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <section className="rounded-lg border bg-card p-5">
              <h2 className="font-serif mb-5 font-semibold">اجرای قرعه‌کشی</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>معیار واجدان شرایط</Label>
                  <Select
                    value={criterion}
                    onValueChange={value =>
                      setCriterion(value as WorldCupLotteryCriterion)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(criterionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {criterion === "CORRECT_ONLY" && (
                    <p className="text-xs text-muted-foreground">
                      کاربر باید امتیاز دقیق هر دو نیمه‌نهایی، امتیاز دقیق
                      فینال و قهرمان فینال را درست پیش‌بینی کرده باشد.
                    </p>
                  )}
                </div>
                {criterion === "CORRECT_ONLY" && (
                  <div className="rounded-lg border bg-muted/60 p-4 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">فینال</span>
                        <strong>
                          {finalTeamA || "تیم نخست"} /{" "}
                          {finalTeamB || "تیم دوم"}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">قهرمان</span>
                        <strong>{finalChampionLabel}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          نتیجه نیمه‌نهایی‌ها
                        </span>
                        <strong>
                          فرانسه {semiFinalFranceScore || "؟"} -{" "}
                          {semiFinalSpainScore || "؟"} اسپانیا / انگلستان{" "}
                          {semiFinalEnglandScore || "؟"} -{" "}
                          {semiFinalArgentinaScore || "؟"} آرژانتین
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          نتیجه فینال
                        </span>
                        <strong>
                          {finalTeamA || "تیم نخست"}{" "}
                          {finalResultAScore || "؟"} -{" "}
                          {finalResultBScore || "؟"}{" "}
                          {finalTeamB || "تیم دوم"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>تعداد برندگان</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={drawCount}
                    onChange={event => setDrawCount(event.target.value)}
                  />
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <span className="text-xs text-muted-foreground">
                    واجد شرایط
                  </span>
                  <strong className="block text-2xl">
                    {eligibility.data?.count ?? 0}
                  </strong>
                </div>
                <div className="grid gap-2">
                  <Label>برای تأیید بنویسید: اجرای قطعی</Label>
                  <Input
                    value={confirmation}
                    onChange={event => setConfirmation(event.target.value)}
                  />
                </div>
                <Button
                  onClick={runLottery}
                  disabled={
                    executeLottery.isPending || Boolean(lotteryDisabledReason)
                  }
                >
                  {executeLottery.isPending
                    ? "در حال اجرا..."
                    : "اجرای قرعه‌کشی"}
                </Button>
                {lotteryDisabledReason && (
                  <p className="text-xs text-muted-foreground">
                    {lotteryDisabledReason}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5">
              <h2 className="font-serif mb-5 font-semibold">
                تاریخچه قرعه‌کشی
              </h2>
              <div className="grid gap-3">
                {(lotteryDraws.data ?? []).map(draw => (
                  <article key={draw.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <strong>اجرای {draw.id.slice(0, 8)}</strong>
                        <p className="text-xs text-muted-foreground">
                          {criterionLabels[draw.criterion]}، {draw.winnerCount}{" "}
                          برنده از {draw.eligibleCount} نفر
                        </p>
                        <small
                          dir="ltr"
                          className="block text-muted-foreground"
                        >
                          {draw.auditHash}
                        </small>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">انتشار عمومی</span>
                        <Switch
                          checked={draw.published}
                          onCheckedChange={published =>
                            publishLottery.mutate(
                              { id: draw.id, published },
                              { onError: error => toast.error(error.message) }
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {draw.winners.map(winner => (
                        <Badge
                          key={`${draw.id}-${winner.position}`}
                          variant="secondary"
                        >
                          #{winner.position} {winner.fullName}
                        </Badge>
                      ))}
                    </div>
                  </article>
                ))}
                {!lotteryDraws.data?.length && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    هنوز قرعه‌کشی اجرا نشده است.
                  </p>
                )}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
