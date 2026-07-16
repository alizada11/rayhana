import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePublicWorldCupWinners,
  useRecoverWorldCupReferenceCode,
  useSubmitWorldCupFinalPrediction,
  useSubmitWorldCupPrediction,
  useWorldCupFinalStage,
  useWorldCupLiveStats,
  useWorldCupStatus,
} from "@/hooks/useWorldCupCampaign";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  getCountryLabel,
  type CountryCode,
} from "@shared/countries";
import {
  WORLD_CUP_CAMPAIGN_DEADLINE_MS,
  WORLD_CUP_FIRST_MATCH_DEADLINE_MS,
} from "@shared/worldCupCampaign";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  Crown,
  Gift,
  LockKeyhole,
  Mail,
  Medal,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

type FranceSpainTeam = "FRANCE" | "SPAIN";
type EnglandArgentinaTeam = "ENGLAND" | "ARGENTINA";
type FinalChampion = "TEAM_A" | "TEAM_B";

type PredictionForm = {
  fullName: string;
  email: string;
  country: CountryCode | "";
  franceSpainAdvances: FranceSpainTeam;
  franceSpainFranceScore: number;
  franceSpainSpainScore: number;
  englandArgentinaAdvances: EnglandArgentinaTeam;
  englandArgentinaEnglandScore: number;
  englandArgentinaArgentinaScore: number;
  termsAccepted: boolean;
};

const initialForm: PredictionForm = {
  fullName: "",
  email: "",
  country: "",
  franceSpainAdvances: "FRANCE",
  franceSpainFranceScore: 0,
  franceSpainSpainScore: 0,
  englandArgentinaAdvances: "ENGLAND",
  englandArgentinaEnglandScore: 0,
  englandArgentinaArgentinaScore: 0,
  termsAccepted: false,
};

function getScoreWinner<T extends string>(
  scoreOne: number,
  scoreTwo: number,
  teamOne: T,
  teamTwo: T
) {
  if (scoreOne === scoreTwo) return null;
  return scoreOne > scoreTwo ? teamOne : teamTwo;
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const distance = Math.max(0, target - now);
  return {
    expired: distance <= 0,
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1000),
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatCampaignDate(value: number | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function BrandMark() {
  const { t } = useTranslation();
  return (
    <div className="wc-brand-mark" aria-label={t("world_cup.brand")}>
      <span className="wc-brand-flourish">R</span>
      <span>
        <strong>{t("world_cup.brand")}</strong>
        <small>{t("world_cup.brand_subtitle")}</small>
      </span>
    </div>
  );
}

function DirectionArrow({
  dir,
  size = 18,
  className,
  reverse = false,
}: {
  dir: string;
  size?: number;
  className?: string;
  reverse?: boolean;
}) {
  const pointsForward = dir === "rtl" ? ArrowLeft : ArrowRight;
  const pointsBack = dir === "rtl" ? ArrowRight : ArrowLeft;
  const Icon = reverse ? pointsBack : pointsForward;
  return <Icon aria-hidden="true" className={className} size={size} />;
}

function Countdown() {
  const { t } = useTranslation();
  const countdown = useCountdown(WORLD_CUP_CAMPAIGN_DEADLINE_MS);
  const units = [
    [t("world_cup.countdown.days"), countdown.days],
    [t("world_cup.countdown.hours"), countdown.hours],
    [t("world_cup.countdown.minutes"), countdown.minutes],
    [t("world_cup.countdown.seconds"), countdown.seconds],
  ] as const;

  if (countdown.expired) {
    return (
      <div className="wc-deadline-ended">{t("world_cup.countdown.ended")}</div>
    );
  }

  return (
    <div className="wc-countdown" aria-label={t("world_cup.hero.deadline")}>
      {units.map(([label, value]) => (
        <div className="wc-countdown-unit" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function CountrySelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: CountryCode | "";
  onChange: (value: CountryCode | "") => void;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState(value ? getCountryLabel(value) : "");
  const lang = i18n.language?.split("-")[0] || "en";
  const englishDisplayNames = useMemo(
    () =>
      new Intl.DisplayNames(["en"], {
        type: "region",
      }),
    []
  );
  const persianDisplayNames = useMemo(
    () =>
      new Intl.DisplayNames(["fa"], {
        type: "region",
      }),
    []
  );
  const pashtoDisplayNames = useMemo(
    () =>
      new Intl.DisplayNames(["ps"], {
        type: "region",
      }),
    []
  );
  const countrySearchItems = useMemo(
    () =>
      COUNTRIES.map(([code, label]) => {
        const englishLabel = englishDisplayNames.of(code) ?? code;
        const persianLabel = persianDisplayNames.of(code) ?? label;
        const pashtoLabel = pashtoDisplayNames.of(code) ?? label;
        const displayLabel =
          lang === "ps"
            ? pashtoLabel
            : lang === "fa"
              ? persianLabel
              : englishLabel;

        return {
          code,
          displayLabel,
          searchLabels: Array.from(
            new Set(
              [
                englishLabel,
                persianLabel,
                pashtoLabel,
                label,
                code === "DE" ? "جرمنی" : "",
                code === "DE" ? "جرمني" : "",
                code === "DE" ? "Germany" : "",
                code === "DE" ? "آلمان" : "",
              ].filter(Boolean)
            )
          ),
        };
      }),
    [englishDisplayNames, lang, pashtoDisplayNames, persianDisplayNames]
  );
  const normalizeCountrySearch = (text: string) =>
    text
      .trim()
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, "");
  const filtered = useMemo(() => {
    const normalized = normalizeCountrySearch(query);
    if (!normalized) return countrySearchItems;
    return countrySearchItems
      .filter(({ searchLabels }) =>
        searchLabels.some(label =>
          normalizeCountrySearch(label).includes(normalized)
        )
      )
      .sort((a, b) => {
        const aStarts = a.searchLabels.some(label =>
          normalizeCountrySearch(label).startsWith(normalized)
        );
        const bStarts = b.searchLabels.some(label =>
          normalizeCountrySearch(label).startsWith(normalized)
        );
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.displayLabel.localeCompare(b.displayLabel, lang);
      });
  }, [countrySearchItems, query]);

  useEffect(() => {
    if (!value) return;
    const selected = countrySearchItems.find(item => item.code === value);
    if (selected) setQuery(selected.displayLabel);
  }, [countrySearchItems, value]);

  const update = (text: string) => {
    setQuery(text);
    const normalized = normalizeCountrySearch(text);
    const match = countrySearchItems.find(
      ({ searchLabels }) =>
        normalized.length > 2 &&
        searchLabels.some(label => normalizeCountrySearch(label) === normalized)
    );
    onChange(match?.code ?? "");
  };

  const chooseCountry = (code: CountryCode, displayLabel: string) => {
    setQuery(displayLabel);
    onChange(code);
  };

  return (
    <div className="wc-country-search-wrap">
      <Search aria-hidden="true" size={18} />
      <Input
        id={id}
        autoComplete="country-name"
        placeholder={t("world_cup.prediction.country_ph")}
        required
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={Boolean(query && filtered.length && !value)}
        aria-controls={`${id}-options`}
        value={query}
        onChange={event => update(event.target.value)}
      />
      {query && filtered.length > 0 && !value && (
        <div className="wc-country-options" id={`${id}-options`} role="listbox">
          {filtered.slice(0, 8).map(({ code, displayLabel, searchLabels }) => (
            <button
              key={code}
              onClick={() => chooseCountry(code, displayLabel)}
              role="option"
              type="button"
            >
              <span>{displayLabel}</span>
              <small>{searchLabels.slice(0, 3).join(" / ")}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
  disabled = false,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  max?: number;
}) {
  const changeScore = (nextValue: number) => {
    onChange(Math.min(max, Math.max(0, nextValue)));
  };

  return (
    <label className="wc-score-box">
      <span>{label}</span>
      <span className="wc-score-stepper">
        <button
          aria-label={`${label} -1`}
          disabled={disabled || value <= 0}
          onClick={() => changeScore(value - 1)}
          type="button"
        >
          <Minus size={16} />
        </button>
        <output aria-live="polite">{value}</output>
        <button
          aria-label={`${label} +1`}
          disabled={disabled || value >= max}
          onClick={() => changeScore(value + 1)}
          type="button"
        >
          <Plus size={16} />
        </button>
      </span>
    </label>
  );
}

function MatchCard({
  index,
  teamOne,
  teamTwo,
  scoreOne,
  scoreTwo,
  onScoreOne,
  onScoreTwo,
  disabled = false,
}: {
  index: string;
  teamOne: string;
  teamTwo: string;
  scoreOne: number;
  scoreTwo: number;
  onScoreOne: (value: number) => void;
  onScoreTwo: (value: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={cn("wc-match-card", disabled && "wc-match-card-disabled")}
    >
      <div className="wc-match-header">
        <span>{index}</span>
        <span className="wc-match-note">
          {t("world_cup.prediction.match_note")}
        </span>
      </div>
      <div className="wc-score-row">
        <ScoreInput
          disabled={disabled}
          label={teamOne}
          value={scoreOne}
          onChange={onScoreOne}
        />
        <span className="wc-versus">-</span>
        <ScoreInput
          disabled={disabled}
          label={teamTwo}
          value={scoreTwo}
          onChange={onScoreTwo}
        />
      </div>
    </section>
  );
}

function PrizeCard({
  rank,
  title,
  description,
  badge,
  featured,
}: {
  rank: string;
  title: string;
  description: string;
  badge: string;
  featured?: boolean;
}) {
  return (
    <article
      className={cn("wc-prize-card", featured && "wc-prize-card-featured")}
    >
      <div className="wc-prize-rank">
        <Medal size={20} /> {rank}
      </div>
      <div className="wc-prize-pot-visual">
        <img src="/images/rayhana-post.png" alt={title} />
      </div>
      <h3 className="font-serif">{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function LiveStats() {
  const { t } = useTranslation();
  const stats = useWorldCupLiveStats();
  const [displayedTotal, setDisplayedTotal] = useState(0);

  useEffect(() => {
    setDisplayedTotal(stats.data?.totalPredictions ?? 0);
  }, [stats.data?.totalPredictions]);

  return (
    <section
      className="wc-stats-section"
      id="live-stats"
      aria-labelledby="live-stats-title"
    >
      <div className="wc-campaign-container">
        <div className="wc-stats-heading">
          <div>
            <span className="wc-section-kicker-white">
              <BarChart3 aria-hidden="true" size={16} />{" "}
              {t("world_cup.stats.kicker")}
            </span>
            <h2 className="font-serif" id="live-stats-title">
              {t("world_cup.stats.title")}
            </h2>
            <p>{t("world_cup.stats.description")}</p>
          </div>
          <div className="wc-live-total" aria-live="polite">
            <span>
              <i aria-hidden="true" /> {t("world_cup.stats.total_live")}
            </span>
            <strong>{displayedTotal}</strong>
            <small>{t("world_cup.stats.total_label")}</small>
            <em>{t("world_cup.stats.total_note")}</em>
          </div>
        </div>

        {stats.isLoading ? (
          <div className="wc-stats-status">{t("world_cup.stats.loading")}</div>
        ) : stats.isError ? (
          <div className="wc-stats-status wc-stats-error">
            {t("world_cup.stats.error")}
          </div>
        ) : !stats.data?.totalPredictions &&
          !stats.data?.finalGame?.totalPredictions ? (
          <div className="wc-stats-status">{t("world_cup.stats.empty")}</div>
        ) : (
          <div
            className={cn(
              "wc-stats-grid",
              stats.data.finalGame && "wc-stats-grid-with-final"
            )}
          >
            {stats.data.matchups.map((matchup, index) => (
              <article
                className={cn(
                  "wc-stats-card",
                  index === 0
                    ? "wc-stats-card-first-match"
                    : "wc-stats-card-second-match"
                )}
                key={matchup.id}
              >
                <div className="wc-stats-card-title">
                  <span>
                    {index === 0
                      ? t("world_cup.stats.match_one")
                      : t("world_cup.stats.match_two")}
                  </span>
                  <small>{t("world_cup.stats.advancing")}</small>
                </div>
                {matchup.teams.map(team => (
                  <div className="wc-team-stat" key={team.code}>
                    <div className="wc-team-stat-meta">
                      <span>{team.label}</span>
                      <strong>{team.percentage}%</strong>
                    </div>
                    <div
                      className="wc-stat-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={team.percentage}
                    >
                      <span style={{ width: `${team.percentage}%` }} />
                    </div>
                    <small>
                      {t("world_cup.stats.choices", { count: team.count })}
                    </small>
                  </div>
                ))}
              </article>
            ))}
            {stats.data.finalGame && (
              <article className="wc-stats-card wc-stats-card-final">
                <div className="wc-final-live-total-parent">
                  <div className="wc-final-live-total">
                    <Trophy aria-hidden="true" size={16} />
                    {t("world_cup.stats.final_total", {
                      count: stats.data.finalGame.totalPredictions,
                    })}
                  </div>
                </div>
                <div className="wc-stats-card-title">
                  <span>{t("world_cup.stats.final_game")}</span>
                  <small>{t("world_cup.stats.champion")}</small>
                </div>
                {stats.data.finalGame.teams.map(team => (
                  <div className="wc-team-stat" key={team.code}>
                    <div className="wc-team-stat-meta">
                      <span>{team.label}</span>
                      <strong>{team.percentage}%</strong>
                    </div>
                    <div
                      className="wc-stat-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={team.percentage}
                    >
                      <span style={{ width: `${team.percentage}%` }} />
                    </div>
                    <small>
                      {t("world_cup.stats.choices", { count: team.count })}
                    </small>
                  </div>
                ))}
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FinalStage({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const stage = useWorldCupFinalStage();
  const publicDraws = usePublicWorldCupWinners();
  const submit = useSubmitWorldCupFinalPrediction();
  const recoverReference = useRecoverWorldCupReferenceCode();
  const [missingReferenceCode, setMissingReferenceCode] = useState(false);
  const [email, setEmail] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [message, setMessage] = useState("");
  const [referenceMessage, setReferenceMessage] = useState("");
  const data = stage.data;
  const configured = Boolean(data?.teamA && data?.teamB);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (teamAScore === teamBScore) {
      setMessage(t("world_cup.final.no_draw"));
      return;
    }
    if (missingReferenceCode) {
      if (!fullName.trim() || !country) {
        setMessage(t("world_cup.final.reference_required"));
        return;
      }
    } else if (!referenceCode.trim()) {
      setMessage(t("world_cup.final.reference_required"));
      return;
    }
    submit.mutate(
      {
        email,
        referenceCode: missingReferenceCode
          ? ""
          : referenceCode.trim().toUpperCase(),
        fullName: missingReferenceCode ? fullName.trim() : undefined,
        country: missingReferenceCode ? country : undefined,
        teamAScore,
        teamBScore,
        champion: teamAScore > teamBScore ? "TEAM_A" : "TEAM_B",
      },
      {
        onSuccess: result =>
          setMessage(
            t("world_cup.final.success", { name: result.participantName })
          ),
        onError: error => setMessage(error.message),
      }
    );
  };

  const handleRecoverReference = () => {
    setReferenceMessage("");
    if (!email.trim()) {
      setReferenceMessage(t("world_cup.final.recover_email_required"));
      return;
    }
    recoverReference.mutate(
      { email },
      {
        onSuccess: () => setReferenceMessage(t("world_cup.final.recover_sent")),
        onError: error => setReferenceMessage(error.message),
      }
    );
  };

  return (
    <>
      <section className="wc-final-stage-section" id="final-stage">
        <div className="wc-campaign-container wc-final-stage-shell">
          <div className="wc-final-stage-intro">
            <span className="wc-section-kicker">
              <Trophy aria-hidden="true" size={16} />{" "}
              {t("world_cup.final.kicker")}
            </span>
            <h2 className="font-serif">{t("world_cup.final.title")}</h2>
            <p>{t("world_cup.final.description")}</p>
            <div className="wc-reference-reminder">
              <LockKeyhole aria-hidden="true" size={20} />
              <span>
                <strong>{t("world_cup.final.reminder_title")}</strong>
                <small>{t("world_cup.final.reminder_desc")}</small>
              </span>
            </div>
          </div>

          <div className="wc-final-stage-card">
            {stage.isLoading ? (
              <div className="wc-final-stage-status">
                {t("world_cup.final.loading")}
              </div>
            ) : data?.status === "OPEN" && configured ? (
              <form className="wc-final-public-form" onSubmit={handleSubmit}>
                <div className="wc-final-card-top">
                  <div className="wc-final-open-label">
                    <i aria-hidden="true" /> {t("world_cup.final.open")}
                  </div>
                  {data.deadline && (
                    <span className="wc-final-card-deadline">
                      <Clock3 aria-hidden="true" size={16} />
                      {formatCampaignDate(data.deadline, locale)}
                    </span>
                  )}
                </div>
                <div className="wc-final-teams">
                  <div>
                    <span>{t("world_cup.final.team_a")}</span>
                    <strong>&nbsp;{data.teamA}</strong>
                  </div>
                  <b>
                    <Trophy aria-hidden="true" size={18} />
                    {t("world_cup.final.final")}
                  </b>
                  <div>
                    <span>{t("world_cup.final.team_b")}</span>
                    <strong>&nbsp;{data.teamB}</strong>
                  </div>
                </div>

                <div className="wc-final-score-panel">
                  <span>{t("world_cup.final.result_label")}</span>
                  <div className="wc-final-score-fields">
                    <ScoreInput
                      label={data.teamA ?? ""}
                      max={30}
                      value={teamAScore}
                      onChange={setTeamAScore}
                    />
                    <span aria-hidden="true">-</span>
                    <ScoreInput
                      label={data.teamB ?? ""}
                      max={30}
                      value={teamBScore}
                      onChange={setTeamBScore}
                    />
                  </div>
                </div>
                <div className="wc-final-identity-fields">
                  <div>
                    <Label className="py-2" htmlFor="final-email">
                      {t("world_cup.final.email")}
                    </Label>
                    <Input
                      id="final-email"
                      dir="ltr"
                      type="email"
                      required
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  {missingReferenceCode ? (
                    <>
                      <div>
                        <Label className="py-2" htmlFor="final-full-name">
                          {t("world_cup.prediction.full_name")}
                        </Label>
                        <Input
                          id="final-full-name"
                          autoComplete="name"
                          required
                          value={fullName}
                          onChange={event => setFullName(event.target.value)}
                          placeholder={t("world_cup.prediction.full_name_ph")}
                        />
                      </div>
                      <div>
                        <Label className="py-2" htmlFor="final-country">
                          {t("world_cup.prediction.country")}
                        </Label>
                        <CountrySelect
                          id="final-country"
                          value={country}
                          onChange={setCountry}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label className="py-2" htmlFor="final-reference">
                        {t("world_cup.final.reference")}
                      </Label>
                      <Input
                        id="final-reference"
                        dir="ltr"
                        minLength={10}
                        maxLength={10}
                        required
                        value={referenceCode}
                        onChange={event =>
                          setReferenceCode(event.target.value.toUpperCase())
                        }
                        placeholder="XXXXXXXXXX"
                      />
                      <button
                        className="wc-reference-recover"
                        disabled={recoverReference.isPending}
                        onClick={handleRecoverReference}
                        type="button"
                      >
                        {recoverReference.isPending
                          ? t("world_cup.final.recover_sending")
                          : t("world_cup.final.recover_reference")}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 wc-final-reference-toggle">
                    <Checkbox
                      id="final-missing-reference"
                      checked={missingReferenceCode}
                      onCheckedChange={checked =>
                        setMissingReferenceCode(checked === true)
                      }
                    />
                    <Label htmlFor="final-missing-reference">
                      {t("world_cup.final.no_reference_code")}
                    </Label>
                  </div>
                </div>
                {referenceMessage && (
                  <p
                    className={
                      recoverReference.isError
                        ? "wc-form-error"
                        : "wc-final-success"
                    }
                  >
                    {referenceMessage}
                  </p>
                )}
                {message && (
                  <p
                    className={
                      submit.isError ? "wc-form-error" : "wc-final-success"
                    }
                  >
                    {message}
                  </p>
                )}
                <Button
                  className="wc-form-submit wc-final-submit"
                  disabled={submit.isPending}
                  type="submit"
                >
                  {submit.isPending
                    ? t("world_cup.final.submitting")
                    : t("world_cup.final.submit")}
                  <LockKeyhole size={17} />
                </Button>
              </form>
            ) : data?.status === "RESULTS" && configured && data.result ? (
              <div className="wc-final-result-state">
                <div className="wc-final-result-crown">
                  <Crown size={28} />
                </div>
                <span className="wc-final-result-kicker">
                  {t("world_cup.final.result_label")}
                </span>
                <div className="wc-final-result-board">
                  <div
                    className={cn(
                      "wc-final-result-team",
                      data.result.champion === "TEAM_A" && "winner"
                    )}
                  >
                    <small>{t("world_cup.final.team_a")}</small>
                    <strong>{data.teamA}</strong>
                    <b>{data.result.teamAScore}</b>
                  </div>
                  <div className="wc-final-result-score">
                    <Trophy size={20} />
                    <span>
                      {data.result.teamAScore} - {data.result.teamBScore}
                    </span>
                    <small>{t("world_cup.final.final")}</small>
                  </div>
                  <div
                    className={cn(
                      "wc-final-result-team",
                      data.result.champion === "TEAM_B" && "winner"
                    )}
                  >
                    <small>{t("world_cup.final.team_b")}</small>
                    <strong>{data.teamB}</strong>
                    <b>{data.result.teamBScore}</b>
                  </div>
                </div>
                <div className="wc-final-champion-ribbon">
                  <span>{t("world_cup.final.champion")}</span>
                  <strong>
                    {data.result.champion === "TEAM_A"
                      ? data.teamA
                      : data.teamB}
                  </strong>
                </div>
              </div>
            ) : data?.status === "CLOSED" ? (
              <div className="wc-final-stage-status">
                <Clock3 size={38} />
                <h3>{t("world_cup.final.closed_title")}</h3>
                <p>{t("world_cup.final.closed_desc")}</p>
              </div>
            ) : (
              <div className="wc-final-stage-status">
                <Sparkles size={38} />
                <h3 className="font-serif">
                  {t("world_cup.final.soon_title")}
                </h3>
                <p>{t("world_cup.final.soon_desc")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="wc-public-winners-section" id="winners">
        <div className="wc-campaign-container">
          <div className="wc-section-heading">
            <span className="wc-section-kicker">
              <Medal aria-hidden="true" size={16} />{" "}
              {t("world_cup.winners.kicker")}
            </span>
            <h2 className="font-serif">{t("world_cup.winners.title")}</h2>
            <p>{t("world_cup.winners.description")}</p>
          </div>
          {publicDraws.isLoading ? (
            <div className="wc-winners-empty">
              {t("world_cup.winners.loading")}
            </div>
          ) : publicDraws.isError ? (
            <div className="wc-winners-empty">
              {t("world_cup.winners.error")}
            </div>
          ) : !publicDraws.data?.length ? (
            <div className="wc-winners-empty">
              <Medal size={28} />
              <strong>{t("world_cup.winners.empty_title")}</strong>
              <span>{t("world_cup.winners.empty_desc")}</span>
            </div>
          ) : (
            <div className="wc-public-draw-list">
              {publicDraws.data.map(draw => (
                <article key={draw.id} className="wc-public-draw-card">
                  <div>
                    <span>
                      {t("world_cup.winners.draw", { id: draw.id.slice(0, 8) })}
                    </span>
                    <small>{formatCampaignDate(draw.executedAt, locale)}</small>
                  </div>
                  <ol>
                    {draw.winners.map(winner => (
                      <li key={`${draw.id}-${winner.position}`}>
                        <span>{winner.position}</span>
                        <strong>{winner.name}</strong>
                        <small>{getCountryLabel(winner.country)}</small>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function WorldCupPrediction() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PredictionForm>(initialForm);
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const status = useWorldCupStatus();
  const submit = useSubmitWorldCupPrediction();
  const countdown = useCountdown(WORLD_CUP_CAMPAIGN_DEADLINE_MS);
  const firstMatchCountdown = useCountdown(WORLD_CUP_FIRST_MATCH_DEADLINE_MS);
  const lang = i18n.language?.split("-")[0] || "en";
  const termsHref = ["en", "fa", "ps"].includes(lang)
    ? `~/${lang}/world-cup-prediction/terms`
    : "~/world-cup-prediction/terms";
  const dir = t("world_cup.dir");
  const locale = t("world_cup.locale");
  const isRtl = dir === "rtl";
  const teams = {
    FRANCE: t("world_cup.fields.france"),
    SPAIN: t("world_cup.fields.spain"),
    ENGLAND: t("world_cup.fields.england"),
    ARGENTINA: t("world_cup.fields.argentina"),
  };
  const registrationClosed = countdown.expired || status.data?.isOpen === false;
  const firstMatchClosed =
    firstMatchCountdown.expired || status.data?.isFirstMatchOpen === false;
  const prizes = asArray<{
    rank: string;
    title: string;
    description: string;
    badge: string;
  }>(t("world_cup.prizes.cards", { returnObjects: true }));
  const markets = asArray<string>(
    t("world_cup.prizes.markets", { returnObjects: true })
  );
  const rules = asArray<string>(
    t("world_cup.prizes.rules", { returnObjects: true })
  );
  const steps = asArray<[string, string, string]>(
    t("world_cup.how.steps", { returnObjects: true })
  );
  const marquee = asArray<string>(
    t("world_cup.hero.marquee", { returnObjects: true })
  );
  const pills = asArray<string>(
    t("world_cup.hero.pills", { returnObjects: true })
  );

  const contactValid = useMemo(
    () =>
      form.fullName.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(form.email) &&
      form.country !== "",
    [form.country, form.email, form.fullName]
  );

  const patch = <K extends keyof PredictionForm>(
    key: K,
    value: PredictionForm[K]
  ) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const goToPredictions = () => {
    if (!contactValid) {
      setError(t("world_cup.prediction.required"));
      return;
    }
    setError("");
    setStep(2);
  };

  const shareText = useMemo(() => {
    const franceSpainWinner = getScoreWinner(
      form.franceSpainFranceScore,
      form.franceSpainSpainScore,
      "FRANCE",
      "SPAIN"
    );
    const englandArgentinaWinner = getScoreWinner(
      form.englandArgentinaEnglandScore,
      form.englandArgentinaArgentinaScore,
      "ENGLAND",
      "ARGENTINA"
    );

    return [
      t("world_cup.share.line1"),
      `${teams.FRANCE} ${form.franceSpainFranceScore}-${form.franceSpainSpainScore} ${teams.SPAIN}; ${franceSpainWinner ? teams[franceSpainWinner] : "-"}`,
      `${teams.ENGLAND} ${form.englandArgentinaEnglandScore}-${form.englandArgentinaArgentinaScore} ${teams.ARGENTINA}; ${englandArgentinaWinner ? teams[englandArgentinaWinner] : "-"}`,
      referenceCode
        ? `${t("world_cup.prediction.reference_label")}: ${referenceCode}`
        : "",
      t("world_cup.share.line4"),
      typeof window === "undefined"
        ? "https://www.rayhana.com/world-cup-prediction"
        : window.location.href,
    ]
      .filter(Boolean)
      .join("\n");
  }, [form, referenceCode, t, teams]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to the textarea fallback below.
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  };

  const handleCopyShare = async () => {
    const text = shareText;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        setCopyFeedback(t("world_cup.prediction.share_done"));
        return;
      } catch {
        // Fall back to copy when sharing is cancelled or unavailable.
      }
    }

    const copied = await copyToClipboard(text);
    setCopyFeedback(
      copied
        ? t("world_cup.prediction.copy_done")
        : t("world_cup.prediction.copy_failed")
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (registrationClosed) {
      setError(t("world_cup.prediction.closed"));
      return;
    }
    if (!form.termsAccepted) {
      setError(t("world_cup.prediction.terms_required"));
      return;
    }
    if (!form.country) return;

    const franceSpainAdvances = getScoreWinner(
      form.franceSpainFranceScore,
      form.franceSpainSpainScore,
      "FRANCE",
      "SPAIN"
    );
    const englandArgentinaAdvances = getScoreWinner(
      form.englandArgentinaEnglandScore,
      form.englandArgentinaArgentinaScore,
      "ENGLAND",
      "ARGENTINA"
    );
    if (
      (!firstMatchClosed && !franceSpainAdvances) ||
      !englandArgentinaAdvances
    ) {
      setError(t("world_cup.prediction.no_draw"));
      return;
    }

    const firstMatchValues = firstMatchClosed
      ? {
          franceSpainAdvances: null,
          franceSpainFranceScore: null,
          franceSpainSpainScore: null,
        }
      : {
          franceSpainAdvances: franceSpainAdvances as FranceSpainTeam,
          franceSpainFranceScore: form.franceSpainFranceScore,
          franceSpainSpainScore: form.franceSpainSpainScore,
        };

    submit.mutate(
      {
        ...form,
        country: form.country,
        ...firstMatchValues,
        englandArgentinaAdvances,
        termsAccepted: true,
      },
      {
        onSuccess: result => {
          setRegistrationId(result.registrationId);
          setReferenceCode(result.referenceCode);
          setError("");
        },
        onError: mutationError => setError(mutationError.message),
      }
    );
  };

  return (
    <div
      className={cn("wc-campaign-page", isRtl ? "font-vazir" : "font-poppins")}
      dir={dir}
      lang={lang}
    >
      <header className="wc-site-header">
        <div className="wc-campaign-container wc-header-inner">
          <Link href="/" className="wc-brand-link">
            <BrandMark />
          </Link>
          <nav aria-label="Campaign navigation">
            <a href="#prizes">{t("world_cup.nav.prizes")}</a>
            <a href="#how-it-works">{t("world_cup.nav.how")}</a>
            <a href="#final-stage">{t("world_cup.nav.final")}</a>
            <Link href={termsHref}>{t("world_cup.nav.terms")}</Link>
          </nav>
          <Button asChild className="wc-header-cta">
            <a href="#prediction">{t("world_cup.nav.predict")}</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="wc-hero-section">
          <div className="wc-hero-grain" />
          <div className="wc-campaign-container wc-hero-grid">
            <div className="wc-hero-copy">
              <span className="wc-eyebrow">
                <Sparkles size={17} /> {t("world_cup.hero.eyebrow")}
              </span>
              <h1 className="font-serif">{t("world_cup.hero.title")}</h1>
              <p>{t("world_cup.hero.description")}</p>
              <div className="wc-hero-actions">
                <Button asChild size="lg" className="wc-gold-button">
                  <a href="#final-stage">
                    {t("world_cup.hero.cta")}{" "}
                    <DirectionArrow dir={dir} size={19} />
                  </a>
                </Button>
                <a className="wc-text-link" href="#final-stage">
                  {t("world_cup.hero.how")}{" "}
                  <DirectionArrow dir={dir} size={18} />
                </a>
              </div>
              <div className="wc-deadline-card">
                <div className="wc-deadline-label">
                  <Clock3 size={18} />
                  <span>{t("world_cup.hero.deadline")}</span>
                </div>
                <Countdown />
              </div>
            </div>
            <div className="wc-hero-product">
              <div className="wc-sun-disc" />
              <div className="wc-hero-badge">
                <Crown size={20} />
                <span>
                  {t("world_cup.hero.badge")}
                  <br />
                  <strong>{t("world_cup.hero.badge_strong")}</strong>
                </span>
              </div>
              <img
                src="/images/rayhana-pot.png"
                alt={t("world_cup.hero.badge_strong")}
              />
              <div className="wc-size-pills">
                {pills.map(pill => (
                  <span key={pill}>{pill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="wc-hero-marquee">
            <span>{marquee[0]}</span>
            <i>x</i>
            <span>{marquee[1]}</span>
          </div>
        </section>

        <section className="wc-prizes-section" id="prizes">
          <div className="wc-campaign-container">
            <div className="wc-section-heading">
              <span className="wc-section-kicker">
                {t("world_cup.prizes.kicker")}
              </span>
              <h2 className="font-serif">{t("world_cup.prizes.title")}</h2>
              <p>{t("world_cup.prizes.description")}</p>
            </div>
            <div className="wc-prize-grid">
              {prizes.map((prize, index) => (
                <PrizeCard key={prize.rank} {...prize} featured={index === 0} />
              ))}
            </div>
            <div className="wc-amazon-prize">
              <div className="wc-amazon-icon">
                <Gift size={28} />
              </div>
              <div>
                <strong>{t("world_cup.prizes.discount_title")}</strong>
                <p>{t("world_cup.prizes.discount_desc")}</p>
              </div>
              <div className="wc-store-pills">
                {markets.map(market => (
                  <span key={market}>{market}</span>
                ))}
              </div>
            </div>

            <section className="wc-discount-terms">
              <div className="wc-discount-terms-heading">
                <span>
                  <ShieldCheck size={18} /> {t("world_cup.prizes.terms_kicker")}
                </span>
                <h3 className="font-serif">
                  {t("world_cup.prizes.terms_title")}
                </h3>
                <p>{t("world_cup.prizes.terms_desc")}</p>
              </div>
              <div className="wc-discount-market-grid">
                <article>
                  <div className="wc-discount-market-icon">
                    <Gift size={21} />
                  </div>
                  <div>
                    <strong>
                      {t("world_cup.prizes.market_shopino_title")}
                    </strong>
                    <p>{t("world_cup.prizes.market_shopino_desc")}</p>
                  </div>
                </article>
                <article>
                  <div className="wc-discount-market-icon">
                    <Gift size={21} />
                  </div>
                  <div>
                    <strong>{t("world_cup.prizes.market_amazon_title")}</strong>
                    <p>{t("world_cup.prizes.market_amazon_desc")}</p>
                  </div>
                </article>
              </div>
              <ul className="wc-discount-rules-list">
                {rules.map(rule => (
                  <li key={rule}>
                    <Check size={17} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="wc-discount-terms-footer">
                <span>{t("world_cup.prizes.footer_note")}</span>
                <Link href={termsHref}>{t("world_cup.prizes.full_terms")}</Link>
              </div>
            </section>
          </div>
        </section>

        <section className="wc-how-section" id="how-it-works">
          <div className="wc-campaign-container wc-how-grid">
            <div className="wc-section-heading wc-right-aligned">
              <span className="wc-section-kicker">
                {t("world_cup.how.kicker")}
              </span>
              <h2 className="font-serif">{t("world_cup.how.title")}</h2>
            </div>
            <div className="wc-steps-list">
              {steps.map(([number, title, text]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div>
                    <h3 className="font-serif">{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LiveStats />
        <FinalStage locale={locale} />

        <section className="hidden wc-prediction-section" id="prediction">
          <div className="wc-campaign-container wc-form-layout">
            <aside className="wc-form-aside">
              <span className="wc-eyebrow">
                <Trophy size={17} /> {t("world_cup.prediction.kicker")}
              </span>
              <h2 className="font-serif">{t("world_cup.prediction.title")}</h2>
              <p>{t("world_cup.prediction.description")}</p>
              <div className="wc-trust-note">
                <ShieldCheck size={22} />
                <span>
                  <strong>{t("world_cup.prediction.trust_title")}</strong>
                  <small>{t("world_cup.prediction.trust_desc")}</small>
                </span>
              </div>
            </aside>

            <div className="wc-prediction-panel">
              {registrationId ? (
                <div className="wc-success-state">
                  <div className="wc-success-icon">
                    <Check size={34} />
                  </div>
                  <span>{t("world_cup.prediction.success_label")}</span>
                  <h2 className="font-serif">
                    {t("world_cup.prediction.success_title")}
                  </h2>
                  <p>
                    {t("world_cup.prediction.success_desc", {
                      id: registrationId.slice(0, 8),
                    })}
                  </p>
                  <div className="wc-reference-code-box">
                    <span>{t("world_cup.prediction.reference_label")}</span>
                    <strong dir="ltr">{referenceCode}</strong>
                    <small>{t("world_cup.prediction.reference_hint")}</small>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyShare}
                  >
                    {t("world_cup.prediction.copy_share")}
                  </Button>
                  {copyFeedback && (
                    <small className="wc-final-success">{copyFeedback}</small>
                  )}
                  <Button
                    className="wc-success-back"
                    variant="ghost"
                    onClick={() => {
                      setRegistrationId("");
                      setReferenceCode("");
                      setForm(initialForm);
                      setStep(1);
                    }}
                  >
                    {t("world_cup.prediction.reset")}
                  </Button>
                </div>
              ) : registrationClosed ? (
                <div className="wc-success-state wc-closed-state">
                  <Clock3 size={42} />
                  <h2>{t("world_cup.prediction.closed")}</h2>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="wc-form-progress">
                    <button
                      className={step === 1 ? "active" : "complete"}
                      onClick={() => setStep(1)}
                      type="button"
                    >
                      <span>{step > 1 ? <Check size={15} /> : "1"}</span>{" "}
                      {t("world_cup.prediction.step_contact")}
                    </button>
                    <div />
                    <button
                      className={step === 2 ? "active" : ""}
                      disabled={!contactValid}
                      onClick={() => setStep(2)}
                      type="button"
                    >
                      <span>2</span> {t("world_cup.prediction.step_prediction")}
                    </button>
                  </div>

                  {step === 1 ? (
                    <div className="wc-form-step">
                      <div className="wc-form-title">
                        <span>{t("world_cup.prediction.contact_step")}</span>
                        <h3 className="font-serif">
                          {t("world_cup.prediction.contact_title")}
                        </h3>
                        <p>{t("world_cup.prediction.contact_desc")}</p>
                      </div>
                      <div className="wc-field-grid">
                        <div className="wc-field-group wc-full-field">
                          <Label htmlFor="fullName">
                            {t("world_cup.prediction.full_name")}
                          </Label>
                          <div className="wc-input-wrap">
                            <UserRound size={18} />
                            <Input
                              id="fullName"
                              autoComplete="name"
                              required
                              value={form.fullName}
                              onChange={event =>
                                patch("fullName", event.target.value)
                              }
                              placeholder={t(
                                "world_cup.prediction.full_name_ph"
                              )}
                            />
                          </div>
                        </div>
                        <div className="wc-field-group wc-full-field">
                          <Label htmlFor="email">
                            {t("world_cup.prediction.email")}
                          </Label>
                          <div className="wc-input-wrap">
                            <Mail size={18} />
                            <Input
                              id="email"
                              autoComplete="email"
                              dir="ltr"
                              type="email"
                              required
                              value={form.email}
                              onChange={event =>
                                patch("email", event.target.value)
                              }
                              placeholder={t("world_cup.prediction.email_ph")}
                            />
                          </div>
                        </div>
                        <div className="wc-field-group wc-full-field">
                          <Label htmlFor="country">
                            {t("world_cup.prediction.country")}
                          </Label>
                          <CountrySelect
                            id="country"
                            value={form.country}
                            onChange={country => patch("country", country)}
                          />
                        </div>
                      </div>
                      {error && <p className="wc-form-error">{error}</p>}
                      <Button
                        className="mt-6 wc-form-next"
                        onClick={goToPredictions}
                        type="button"
                      >
                        {t("world_cup.prediction.continue")}{" "}
                        <DirectionArrow dir={dir} size={18} />
                      </Button>
                    </div>
                  ) : (
                    <div className="wc-form-step">
                      <div className="wc-form-title">
                        <span>{t("world_cup.prediction.match_step")}</span>
                        <h3 className="font-serif">
                          {t("world_cup.prediction.match_title")}
                        </h3>
                        <p>{t("world_cup.prediction.match_desc")}</p>
                      </div>
                      <MatchCard
                        index={t("world_cup.stats.match_two")}
                        teamOne={teams.ENGLAND}
                        teamTwo={teams.ARGENTINA}
                        scoreOne={form.englandArgentinaEnglandScore}
                        scoreTwo={form.englandArgentinaArgentinaScore}
                        onScoreOne={value =>
                          patch("englandArgentinaEnglandScore", value)
                        }
                        onScoreTwo={value =>
                          patch("englandArgentinaArgentinaScore", value)
                        }
                      />
                      <div className="wc-terms-check">
                        <Checkbox
                          id="termsAccepted"
                          checked={form.termsAccepted}
                          onCheckedChange={checked =>
                            patch("termsAccepted", checked === true)
                          }
                        />
                        <Label htmlFor="termsAccepted">
                          {t("world_cup.prediction.terms")}{" "}
                          <Link href={termsHref}>
                            {t("world_cup.prediction.terms_link")}
                          </Link>
                        </Label>
                      </div>
                      {error && <p className="wc-form-error">{error}</p>}
                      <div className="wc-form-actions">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          type="button"
                        >
                          <DirectionArrow dir={dir} size={18} reverse />{" "}
                          {t("world_cup.prediction.back")}
                        </Button>
                        <Button
                          className="wc-form-submit"
                          disabled={submit.isPending}
                          type="submit"
                        >
                          {submit.isPending
                            ? t("world_cup.prediction.submitting")
                            : t("world_cup.prediction.submit")}
                          <LockKeyhole size={17} />
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
