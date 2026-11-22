import React, { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Award, Check, ShieldCheck, X } from "lucide-react";
import type { CommunityState } from "@shared/community";
import {
  communityCopy,
  communityBadgeLevel,
  type CommunityLanguage,
} from "@/blackfriday/redesign/data/communityCopy";
import {
  communityApi,
  CommunityApiError,
  type CommunityErrorCode,
} from "@/blackfriday/redesign/data/communityApi";

type Notice = CommunityErrorCode | "choose" | "submitted" | "incorrect" | null;

const emptyState = (): CommunityState => ({
  memory: null,
  safety: false,
  recipe: null,
  vote: null,
  pattern: null,
  points: 0,
  expiresAt: "",
});

const completedSteps = (state: CommunityState | null) => [
  !!state?.memory,
  !!state?.safety,
  !!state?.recipe,
  !!state?.vote,
];

function createResponseId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export default function Community({
  language,
}: {
  language: CommunityLanguage;
}) {
  const c = communityCopy[language];
  const id = useId();
  const [state, setState] = useState<CommunityState | null>(null);
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [memory, setMemory] = useState<CommunityState["memory"]>(null);
  const [safety, setSafety] = useState<"intact" | "damaged" | null>(null);
  const [recipe, setRecipe] = useState<CommunityState["recipe"]>(null);
  const [vote, setVote] = useState<CommunityState["vote"]>(null);
  const [pattern, setPattern] = useState<CommunityState["pattern"]>(null);
  const [submitted, setSubmitted] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const responseId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const completionTitle = useRef<HTMLHeadingElement>(null);
  const completion = useRef<HTMLDivElement>(null);
  const coverButton = useRef<HTMLButtonElement>(null);
  const number = (n: number) =>
    new Intl.NumberFormat(
      language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en"
    ).format(n);

  useEffect(() => {
    // Clear only obsolete community-form drafts/tokens from the prior version.
    try {
      [
        "rayhana-table-token-v1",
        "rayhana-table-private-notes-v1",
        "rayhana-table-progress-v1",
        "rayhana-table-anonymous-response-id-v1",
      ].forEach(key => localStorage.removeItem(key));
    } catch {
      // Participation no longer depends on browser storage.
    }
    return () => controller.current?.abort();
  }, []);

  useEffect(() => {
    if (opened) requestAnimationFrame(() => heading.current?.focus());
  }, [opened, step]);

  useEffect(() => {
    if (opened && submitted)
      requestAnimationFrame(() => completionTitle.current?.focus());
  }, [opened, submitted]);

  function navigate(next: number) {
    if (submitted) return;
    setStep(next);
    setNotice(null);
    setOpened(true);
  }

  async function submitFinal(nextState: CommunityState) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice(null);
    const abort = new AbortController();
    controller.current = abort;
    responseId.current ??= createResponseId();
    try {
      await communityApi.submitAnonymous(
        nextState,
        responseId.current,
        abort.signal
      );
      setState(nextState);
      setSubmitted(true);
      setNotice("submitted");
      setOpened(true);
    } catch (error) {
      if (abort.signal.aborted) return;
      setNotice(
        error instanceof CommunityApiError ? error.code : "server"
      );
    } finally {
      if (controller.current === abort) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }

  function submitStep(skip = false) {
    if (busy || submitted) return;
    const previous = state ?? emptyState();
    let next = { ...previous };

    if (step === 0) {
      const choice = skip ? "skip" : memory;
      if (!choice) return setNotice("choose");
      next.memory = choice;
    } else if (step === 1) {
      if (safety !== "intact")
        return setNotice(safety === "damaged" ? "incorrect" : "choose");
      next.safety = true;
    } else if (step === 2) {
      if (!recipe) return setNotice("choose");
      next.recipe = recipe;
    } else {
      if (!vote) return setNotice("choose");
      next.vote = vote;
      next.pattern = pattern;
    }

    const complete = completedSteps(next as CommunityState);
    next.points = complete.filter(Boolean).length * 25;
    setNotice(null);

    if (step < 3) {
      setState(next);
      setStep(step + 1);
      return;
    }

    next.points = 100;
    void submitFinal(next);
  }

  function choices<T extends string>(
    options: Record<T, string>,
    value: T | null,
    change: (value: T) => void,
    name: string
  ) {
    return (
      <div className="rh-choice-grid">
        {(Object.keys(options) as T[]).map(key => (
          <label className="rh-choice" key={key}>
            <input
              type="radio"
              name={`${id}-${name}`}
              value={key}
              checked={value === key}
              disabled={busy}
              onChange={() => change(key)}
            />
            <span>{options[key]}</span>
          </label>
        ))}
      </div>
    );
  }

  const completed = completedSteps(state);
  const points = state?.points ?? 0;
  const tier = communityBadgeLevel(points);
  const nextStep = completed.findIndex(value => !value);
  const headingText = [
    c.memoryTitle,
    c.safetyTitle,
    c.recipeTitle,
    c.conceptTitle,
  ][step];
  const status =
    notice === "submitted"
      ? c.submitted
      : notice === "choose"
        ? c.choose
        : notice === "incorrect"
          ? c.incorrect
        : notice === "offline"
          ? c.offline
          : notice === "network"
            ? c.network
            : notice === "server"
              ? c.server
            : busy
              ? c.loading
              : "";
  const isError = !!notice && !["submitted", "choose"].includes(notice);

  return (
    <section
      id="community"
      className="rh-community"
      dir={language === "en" ? "ltr" : "rtl"}
      lang={language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en"}
      aria-labelledby={`${id}-title`}
    >
      <div className="rh-shell rh-layout">
        <div className="rh-main">
          <div className="rh-cover">
            <div>
              <p className="rh-eyebrow">{c.eyebrow}</p>
              <h2 className="font-serif" id={`${id}-title`}>{c.title}</h2>
              <p className="rh-intro">{c.intro}</p>
              <p className="rh-cover-note">{c.coverNote}</p>
              <div className="rh-actions">
                <button
                  ref={coverButton}
                  className="button primary"
                  disabled={busy || submitted}
                  onClick={() => navigate(nextStep < 0 ? 0 : nextStep)}
                >
                  {submitted ? c.submitted : c.join}
                </button>
                {!submitted && (
                  <button
                    className="rh-link"
                    onClick={() => navigate(nextStep < 0 ? 0 : nextStep)}
                    disabled={busy}
                  >
                    {c.browse}
                  </button>
                )}
              </div>
              <a className="rh-link" href="#collection">
                {c.products}
              </a>
            </div>
            <div className="rh-table-art" aria-hidden="true">
              <span className="rh-art-caption">{c.title}</span>
              <span className="rh-plate" />
            </div>
          </div>

          <div className="rh-step-preview">
            <h3 className="font-serif" id={`${id}-steps-title`}>{c.stepPreview}</h3>
            <p className="rh-small" id={`${id}-steps-points`}>
              {c.stepPoints.replace("{points}", number(25))}
            </p>
          </div>
          <nav
            className="rh-step-nav"
            aria-labelledby={`${id}-steps-title`}
            aria-describedby={`${id}-steps-points`}
          >
            {c.steps.map((label, index) => (
              <button
                key={index}
                id={`${id}-step-${index}`}
                disabled={busy || submitted || (nextStep !== -1 && index > nextStep)}
                aria-expanded={opened && step === index}
                aria-controls={`${id}-dialog`}
                onClick={() => navigate(index)}
              >
                <span>
                  {number(index + 1).padStart(language === "en" ? 2 : 1, "0")}
                </span>
                <span>
                  {label}
                  {completed[index] && (
                    <span className="sr-only"> · {c.completed}</span>
                  )}
                </span>
                {completed[index] && <Check size={14} aria-hidden="true" />}
              </button>
            ))}
          </nav>
          <div className="rh-privacy">
            <h3 className="font-serif">
              <ShieldCheck
                size={16}
                aria-hidden="true"
                style={{ display: "inline", marginInlineEnd: 7 }}
              />
              {c.privacyTitle}
            </h3>
            <p className="rh-small">{c.privacy}</p>
          </div>
          <div
            ref={completion}
            className={`rh-notice${isError ? " is-error" : ""}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={submitted ? -1 : undefined}
          >
            {status}
          </div>
        </div>

        <aside className="rh-progress" aria-label={c.progress}>
          <p className="rh-progress-label">{c.progress}</p>
          <div className="rh-score" role="status" aria-live="polite">
            <strong>{number(points)}</strong>
            <span>
              / {number(100)} {c.points}
            </span>
          </div>
          <progress value={points} max={100} aria-label={c.progress} />
          <div className="rh-badge">
            <Award size={35} strokeWidth={1.2} aria-hidden="true" />
            <strong>{tier === -1 ? c.noBadge : c.badges[tier]}</strong>
          </div>
          <h3 className="rh-journey-title font-serif" id={`${id}-journey-title`}>
            {c.journeyTitle}
          </h3>
          <ol
            className="rh-badge-path"
            role="list"
            aria-labelledby={`${id}-journey-title`}
          >
            {c.badges.map((label, index) => {
              const badgeState =
                index === tier
                  ? "current"
                  : index < tier
                    ? "earned"
                    : "upcoming";
              return (
                <li
                  key={label}
                  data-state={badgeState}
                  aria-current={badgeState === "current" ? "step" : undefined}
                >
                  <span className="rh-badge-threshold">
                    {number((index + 1) * 25)}
                    <span className="sr-only"> {c.points}</span>
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <span className="rh-badge-state">
                      {badgeState === "current"
                        ? c.badgeCurrent
                        : badgeState === "earned"
                          ? c.badgeEarned
                          : c.badgeUpcoming}
                    </span>
                  </div>
                  {badgeState !== "upcoming" && (
                    <Check size={14} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
          <p className="rh-small rh-next-step">
            {nextStep === -1
              ? c.journeyComplete
              : c.nextStep
                  .replace("{step}", c.steps[nextStep])
                  .replace("{points}", number(25))}
          </p>
          <p className="rh-small">{c.badgeNote}</p>
        </aside>
      </div>

      <Dialog.Root open={opened} onOpenChange={setOpened}>
        <Dialog.Portal>
          <Dialog.Overlay className="rh-form-overlay" />
          <Dialog.Content
            id={`${id}-dialog`}
            className={`rh-form-dialog rh-panel ${language === "en" ? "is-ltr" : "is-rtl"}`}
            dir={language === "en" ? "ltr" : "rtl"}
            aria-describedby={`${id}-form-description`}
            onCloseAutoFocus={event => {
              event.preventDefault();
              if (submitted) completion.current?.focus();
              else coverButton.current?.focus();
            }}
          >
            <div className="rh-form-header">
              <div>
                <p className="rh-eyebrow">
                  {submitted
                    ? `${c.badges[3]} · ${number(points)} ${c.points}`
                    : `${c.stepLabel} ${number(step + 1)} / ${number(4)}`}
                </p>
                <Dialog.Description
                  id={`${id}-form-description`}
                  className="rh-small"
                >
                  {submitted ? c.thanks : c.modalIntro}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="rh-form-close" aria-label={c.close}>
                  <X size={20} aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {submitted ? (
              <div className="rh-complete rh-form-success">
                <Dialog.Title
                  ref={completionTitle}
                  tabIndex={-1}
                  className="rh-form-title line-heading campaign-heading font-serif"
                >
                  {c.thanksTitle}
                </Dialog.Title>
                <p className="rh-recognition">{c.companionRecognition}</p>
                <p className="rh-small">{c.thanks}</p>
                <div className="rh-actions">
                  <Dialog.Close asChild>
                    <a className="rh-link" href="#story">
                      {c.story}
                    </a>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <a className="rh-link" href="#collection">
                      {c.products}
                    </a>
                  </Dialog.Close>
                </div>
              </div>
            ) : (
              <>
                <div className="rh-form-progress" aria-hidden="true">
                  <span style={{ width: `${Math.max(points, 25)}%` }} />
                </div>

            <Dialog.Title
              ref={heading}
              tabIndex={-1}
              className="rh-form-title line-heading campaign-heading font-serif"
            >
              {headingText}
            </Dialog.Title>
            {step === 0 && (
              <>
                <p>{c.memoryBody}</p>
                <fieldset disabled={busy}>
                  <legend className="sr-only">{c.memoryTitle}</legend>
                  {choices(c.memoryOptions, memory, setMemory, "memory")}
                </fieldset>
              </>
            )}
            {step === 1 && (
              <>
                <p>{c.safetyBody}</p>
                <fieldset disabled={busy}>
                  <legend>{c.safetyQuestion}</legend>
                  {choices(
                    c.safetyOptions,
                    safety,
                    setSafety,
                    "safety"
                  )}
                </fieldset>
              </>
            )}
            {step === 2 && (
              <>
                <p>{c.recipeBody}</p>
                <fieldset disabled={busy}>
                  <legend className="sr-only">{c.recipeTitle}</legend>
                  {choices(c.recipeOptions, recipe, setRecipe, "recipe")}
                </fieldset>
              </>
            )}
            {step === 3 && (
              <>
                <p className="rh-eyebrow">{c.conceptLabel}</p>
                <p>{c.conceptBody}</p>
                <fieldset disabled={busy}>
                  <legend>{c.voteQuestion}</legend>
                  {choices(c.voteOptions, vote, setVote, "vote")}
                </fieldset>
                <fieldset className="rh-pattern" disabled={busy}>
                  <legend>{c.patternQuestion}</legend>
                  {choices(
                    c.patternOptions,
                    pattern,
                    setPattern,
                    "pattern"
                  )}
                </fieldset>
                <p className="rh-small">{c.conceptNote}</p>
              </>
            )}

            <p
              className={`rh-notice${isError ? " is-error" : ""}`}
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
            <div className="rh-actions">
              {step > 0 && (
                <button
                  className="button outline"
                  disabled={busy}
                  onClick={() => {
                    setNotice(null);
                    setStep(step - 1);
                  }}
                >
                  {c.back}
                </button>
              )}
              {step === 0 && (
                <button
                  className="button outline"
                  disabled={busy}
                  onClick={() => submitStep(true)}
                >
                  {c.skip}
                </button>
              )}
              <button
                className="button primary"
                disabled={busy}
                onClick={() => submitStep()}
              >
                {busy ? c.loading : step === 3 ? c.finish : c.save}
              </button>
            </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
