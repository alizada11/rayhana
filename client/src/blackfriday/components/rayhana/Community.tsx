import React, { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Award, Trash2, X } from "lucide-react";
import type { CommunityState, CommunityStep } from "@shared/community";
import {
  communityCopy,
  communityBadgeLevel,
  type CommunityLanguage,
} from "@/blackfriday/data/communityCopy";
import {
  communityApi,
  CommunityApiError,
  type CommunityErrorCode,
} from "@/blackfriday/data/communityApi";

const NOTES_KEY = "rayhana-table-private-notes-v1";
type Action =
  | { kind: "join" }
  | { kind: "restore"; reveal?: boolean }
  | { kind: "delete" }
  | { kind: "step"; input: CommunityStep };
type Notice =
  | CommunityErrorCode
  | "choose"
  | "saved"
  | "joined"
  | "deleted"
  | "deletedLocalWarning"
  | null;
const done = (s: CommunityState | null) => [
  !!s?.memory,
  !!s?.safety,
  !!s?.recipe,
  !!s?.vote,
];

export default function Community({
  language,
  portalContainer,
}: {
  language: CommunityLanguage;
  portalContainer?: HTMLElement | null;
}) {
  const c = communityCopy[language];
  const id = useId();
  const [state, setState] = useState<CommunityState | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState<Action["kind"] | null>(null);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [memory, setMemory] = useState<CommunityState["memory"]>(null);
  const [safety, setSafety] = useState<"intact" | "damaged" | null>(null);
  const [recipe, setRecipe] = useState<CommunityState["recipe"]>(null);
  const [vote, setVote] = useState<CommunityState["vote"]>(null);
  const [pattern, setPattern] = useState<CommunityState["pattern"]>(null);
  const [memoryText, setMemoryText] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const deleteCancel = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const retry = useRef<Action | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const completionHeading = useRef<HTMLHeadingElement>(null);
  const coverButton = useRef<HTMLButtonElement>(null);
  const number = (n: number) =>
    new Intl.NumberFormat(
      language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en"
    ).format(n);

  function storage(operation: () => void) {
    try {
      operation();
      return true;
    } catch {
      return false;
    }
  }
  function setSession(value: string | null) {
    tokenRef.current = value;
    setToken(value);
    return storage(() =>
      value
        ? localStorage.setItem(TOKEN_KEY, value)
        : localStorage.removeItem(TOKEN_KEY)
    );
  }
  function accept(s: CommunityState, restoreDrafts = false) {
    setState(s);
    if (restoreDrafts) {
      setMemory(s.memory);
      setSafety(s.safety ? "intact" : null);
      setRecipe(s.recipe);
      setVote(s.vote);
      setPattern(s.pattern);
    }
  }
  function navigate(next: number) {
    setStep(next);
    setOpened(true);
    setNotice(null);
  }

  async function perform(action: Action) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(action.kind);
    setNotice(null);
    retry.current = action;
    const abort = new AbortController();
    controller.current = abort;
    try {
      if (action.kind === "restore") {
        if (!tokenRef.current) return;
        const result = await communityApi.restore(
          tokenRef.current,
          abort.signal
        );
        if (!mounted.current) return;
        accept(result.state, true);
        const next = done(result.state).findIndex(value => !value);
        setStep(next === -1 ? 3 : next);
        if (action.reveal) setOpened(true);
      } else if (action.kind === "delete") {
        if (!tokenRef.current) return;
        await communityApi.delete(tokenRef.current, abort.signal);
        if (!mounted.current) return;
        const tokenRemoved = setSession(null);
        setState(null);
        setMemory(null);
        setSafety(null);
        setRecipe(null);
        setVote(null);
        setPattern(null);
        setMemoryText("");
        setSuggestionText("");
        const notesRemoved = storage(() => localStorage.removeItem(NOTES_KEY));
        setDeleteOpen(false);
        setOpened(false);
        setStep(0);
        setNotice(
          tokenRemoved && notesRemoved ? "deleted" : "deletedLocalWarning"
        );
      } else {
        let currentToken = tokenRef.current;
        if (!currentToken) {
          const result = await communityApi.start(abort.signal);
          if (!mounted.current) return;
          currentToken = result.token;
          setSession(currentToken);
          accept(result.state);
        }
        if (action.kind === "join") {
          setOpened(true);
          setNotice("joined");
        } else {
          const result = await communityApi.step(
            currentToken,
            action.input,
            abort.signal
          );
          if (action.input.step === "vote") {
            await communityApi.submitAnonymous(result.state, abort.signal);
          }
          if (!mounted.current) return;
          accept(result.state);
          setNotice("saved");
          const index = ["memory", "safety", "recipe", "vote"].indexOf(
            action.input.step
          );
          if (action.input.step === "vote") {
            setVote(result.state.vote);
            setPattern(result.state.pattern);
          }
          setStep(Math.min(index + 1, 3));
          const journeyComplete = result.state.points === 100;
          setOpened(true);
          if (journeyComplete)
            requestAnimationFrame(() => completionHeading.current?.focus());
        }
      }
      retry.current = null;
    } catch (error) {
      if (abort.signal.aborted || !mounted.current) return;
      const code = error instanceof CommunityApiError ? error.code : "storage";
      setNotice(code);
      if (code === "invalid") {
        setSession(null);
        setState(null);
        retry.current = null;
      }
      if (code === "incorrect") retry.current = null;
    } finally {
      if (controller.current === abort) {
        busyRef.current = false;
        if (mounted.current) setBusy(null);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    try {
      const notes = localStorage.getItem(NOTES_KEY);
      if (notes) {
        try {
          const parsed = JSON.parse(notes);
          if (typeof parsed.memory === "string")
            setMemoryText(parsed.memory.slice(0, 200));
          if (typeof parsed.suggestion === "string")
            setSuggestionText(parsed.suggestion.slice(0, 200));
        } catch {
          /* A malformed private note does not block participation. */
        }
      }
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        tokenRef.current = savedToken;
        setToken(savedToken);
        void perform({ kind: "restore" });
      }
    } catch {
      /* Private browser drafts are optional; server participation remains available. */
    }
    return () => {
      mounted.current = false;
      controller.current?.abort();
      busyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (opened) {
      (state?.points === 100 ? completionHeading.current : heading.current)?.focus();
    }
  }, [opened, step, state?.points]);
  useEffect(() => {
    if (deleteOpen) deleteCancel.current?.focus();
  }, [deleteOpen]);

  function updateNote(kind: "memory" | "suggestion", value: string) {
    const clipped = value.slice(0, 200);
    const notes = {
      memory: kind === "memory" ? clipped : memoryText,
      suggestion: kind === "suggestion" ? clipped : suggestionText,
    };
    if (kind === "memory") setMemoryText(clipped);
    else setSuggestionText(clipped);
    storage(() => localStorage.setItem(NOTES_KEY, JSON.stringify(notes)));
  }
  function submitStep(skip = false) {
    let input: CommunityStep;
    if (step === 0 && (memory || skip)) {
      if (skip) setMemory("skip");
      input = { step: "memory", choice: skip ? "skip" : memory! };
    } else if (step === 1 && safety) input = { step: "safety", answer: safety };
    else if (step === 2 && recipe) input = { step: "recipe", choice: recipe };
    else if (step === 3 && vote)
      input = { step: "vote", choice: vote, ...(pattern ? { pattern } : {}) };
    else {
      setNotice("choose");
      return;
    }
    void perform({ kind: "step", input });
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
              disabled={!!busy}
              onChange={() => change(key)}
            />
            <span>{options[key]}</span>
          </label>
        ))}
      </div>
    );
  }
  const completed = done(state);
  const points = state?.points ?? 0;
  const journeyComplete = points === 100;
  const tier = communityBadgeLevel(points);
  const nextStep = completed.findIndex(value => !value);
  const savedFood =
    state?.memory && state.memory !== "skip"
      ? c.memoryOptions[state.memory]
      : null;
  const isError =
    notice !== null &&
    !["saved", "joined", "deleted", "deletedLocalWarning"].includes(notice);
  const status = busy
    ? busy === "restore"
      ? c.restoring
      : busy === "delete"
        ? c.deleting
        : c.loading
    : notice
      ? c[notice]
      : "";
  const headingText = [
    c.memoryTitle,
    c.safetyTitle,
    c.recipeTitle,
    c.conceptTitle,
  ][step];

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
              <h2 id={`${id}-title`}>{c.title}</h2>
              <p className="rh-intro">{c.intro}</p>
              <p className="rh-cover-note">{c.coverNote}</p>
              <div className="rh-actions">
                <button
                  ref={coverButton}
                  className="button primary"
                  disabled={!!busy}
                  onClick={() =>
                    token
                      ? state
                        ? navigate(step)
                        : void perform({ kind: "restore", reveal: true })
                      : void perform({ kind: "join" })
                  }
                >
                  {token ? c.resume : c.join}
                </button>
                <a className="button outline rh-products-button" href="#collection">
                  {language === "en" ? (
                    <ArrowRight size={16} aria-hidden="true" />
                  ) : (
                    <ArrowLeft size={16} aria-hidden="true" />
                  )}
                  <span>{c.products}</span>
                </a>
              </div>
            </div>
            <div className="rh-table-art" aria-hidden="true">
              <span className="rh-art-caption">{c.title}</span>
              <span className="rh-plate" />
            </div>
          </div>
          <div className="rh-step-preview">
            <h3 id={`${id}-steps-title`}>{c.stepPreview}</h3>
            <p className="rh-small" id={`${id}-steps-points`}>
              {c.stepPoints.replace("{points}", number(25))}
            </p>
          </div>
          <ol className="rh-step-overview" aria-label={c.stepPreview}>
            {c.steps.map((label, index) => (
              <li key={index} data-complete={completed[index] || undefined}>
                <span>
                  {number(index + 1).padStart(language === "en" ? 2 : 1, "0")}
                </span>
                <span>{label}</span>
                {completed[index] && <Check size={13} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className="rh-privacy">
            <h3>
              <ShieldCheck
                size={16}
                aria-hidden="true"
                style={{ display: "inline", marginInlineEnd: 7 }}
              />
              {c.privacyTitle}
            </h3>
            <p className="rh-small">{c.privacy}</p>
            <p className="rh-small">{c.expiry}</p>
          </div>
          {state?.memory && points < 100 && (
            <div className="rh-table-identity">
              <h3>{c.memorySavedTitle}</h3>
              <p className="rh-small">
                {savedFood
                  ? c.memorySavedFood.replace("{food}", savedFood)
                  : c.memorySavedNeutral}
              </p>
            </div>
          )}
          {state?.safety === true && (
            <section
              className="rh-care-guide"
              aria-labelledby={`${id}-care-title`}
            >
              <ShieldCheck size={24} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <h3 id={`${id}-care-title`}>{c.safetyGuideTitle}</h3>
                <p>{c.safetyGuideBody}</p>
              </div>
            </section>
          )}
          <Dialog.Root
            open={opened}
            onOpenChange={value => {
              setOpened(value);
              if (!value) setDeleteOpen(false);
            }}
          >
            <Dialog.Portal container={portalContainer ?? undefined}>
              <Dialog.Overlay className="rh-journey-overlay" />
              <Dialog.Content
                className="rh-journey-dialog"
                dir={language === "en" ? "ltr" : "rtl"}
                onOpenAutoFocus={event => {
                  event.preventDefault();
                  requestAnimationFrame(() =>
                    (journeyComplete
                      ? completionHeading.current
                      : heading.current
                    )?.focus()
                  );
                }}
              >
                <header className="rh-dialog-header">
                  <div>
                    <p className="rh-eyebrow">{c.eyebrow}</p>
                    <Dialog.Title className="rh-dialog-title">
                      {journeyComplete ? c.badges[3] : c.stepPreview}
                    </Dialog.Title>
                    <Dialog.Description className="rh-dialog-description">
                      {journeyComplete
                        ? c.journeyComplete
                        : c.stepPoints.replace("{points}", number(25))}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="rh-dialog-close" aria-label={c.close}>
                    <X size={20} aria-hidden="true" />
                  </Dialog.Close>
                </header>
                {!journeyComplete && (
                  <>
                    <div className="rh-dialog-progress" aria-hidden="true">
                      <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
                    </div>
                    <nav
                      className="rh-step-nav"
                      aria-label={c.stepPreview}
                      aria-describedby={`${id}-steps-points`}
                    >
                      {c.steps.map((label, index) => (
                        <button
                          key={index}
                          id={`${id}-step-${index}`}
                          type="button"
                          disabled={!!busy}
                          aria-current={step === index ? "step" : undefined}
                          aria-controls={`${id}-panel-${index}`}
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
                  </>
                )}
                <div className="rh-journey-scroll">
                  {journeyComplete ? (
                    <div className="rh-complete rh-complete-modal">
                      <p className="rh-eyebrow">
                        {c.badges[3]} · {number(points)} {c.points}
                      </p>
                      <h3 ref={completionHeading} tabIndex={-1}>
                        {savedFood
                          ? c.thanksPersonalTitle.replace("{food}", savedFood)
                          : c.thanksTitle}
                      </h3>
                      <p className="rh-recognition">{c.companionRecognition}</p>
                      <p className="rh-small">{c.thanks}</p>
                      <div className="rh-actions">
                        <a className="rh-link" href="#story" onClick={() => setOpened(false)}>
                          {c.story}
                        </a>
                        <a className="rh-link" href="#collection" onClick={() => setOpened(false)}>
                          {c.products}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
                  <div
                    className={`rh-notice${isError ? " is-error" : ""}`}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {status}
                  </div>
                  {!busy && retry.current && isError && (
                    <button
                      className="rh-link"
                      onClick={() => retry.current && void perform(retry.current)}
                    >
                      {c.retry}
                    </button>
                  )}
                  {c.steps.map((_, index) => (
                    <div
                      key={index}
                      id={`${id}-panel-${index}`}
                      role="region"
                      aria-labelledby={`${id}-step-${index}`}
                      hidden={step !== index}
                    >
                      {step === index && (
                        <div className="rh-panel" aria-busy={!!busy}>
                          <p className="rh-eyebrow">
                            {c.stepLabel} {number(step + 1)} / {number(4)} ·{" "}
                            {completed[step] ? c.completed : c.unsaved}
                          </p>
                          <h3 ref={heading} tabIndex={-1}>
                            {headingText}
                          </h3>
                          {!token && <p className="rh-small">{c.preview}</p>}
                          {step === 0 && (
                            <>
                              <p>{c.memoryBody}</p>
                              <fieldset disabled={!!busy}>
                                <legend className="sr-only">{c.memoryTitle}</legend>
                                {choices(c.memoryOptions, memory, setMemory, "memory")}
                              </fieldset>
                              <div className="rh-note-field">
                                <label htmlFor={`${id}-memory`}>{c.memoryText}</label>
                                <textarea
                                  id={`${id}-memory`}
                                  value={memoryText}
                                  maxLength={200}
                                  disabled={!!busy}
                                  onChange={e => updateNote("memory", e.target.value)}
                                  aria-describedby={`${id}-memory-hint`}
                                />
                                <p className="rh-small" id={`${id}-memory-hint`}>
                                  {c.localHint}
                                </p>
                              </div>
                            </>
                          )}
                          {step === 1 && (
                            <>
                              <p>{c.safetyBody}</p>
                              <fieldset disabled={!!busy}>
                                <legend>{c.safetyQuestion}</legend>
                                {choices(
                                  c.safetyOptions,
                                  safety,
                                  value => {
                                    setSafety(value);
                                    if (notice === "incorrect") setNotice(null);
                                  },
                                  "safety"
                                )}
                              </fieldset>
                            </>
                          )}
                          {step === 2 && (
                            <>
                              <p>{c.recipeBody}</p>
                              <fieldset disabled={!!busy}>
                                <legend className="sr-only">{c.recipeTitle}</legend>
                                {choices(c.recipeOptions, recipe, setRecipe, "recipe")}
                              </fieldset>
                              {recipe === "suggestion" && (
                                <div className="rh-note-field">
                                  <label htmlFor={`${id}-suggestion`}>
                                    {c.suggestionText}
                                  </label>
                                  <textarea
                                    id={`${id}-suggestion`}
                                    value={suggestionText}
                                    maxLength={200}
                                    disabled={!!busy}
                                    onChange={e => updateNote("suggestion", e.target.value)}
                                    aria-describedby={`${id}-suggestion-hint`}
                                  />
                                  <p className="rh-small" id={`${id}-suggestion-hint`}>
                                    {c.localHint}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          {step === 3 && (
                            <>
                              <p className="rh-eyebrow">{c.conceptLabel}</p>
                              <p>{c.conceptBody}</p>
                              <fieldset disabled={!!busy}>
                                <legend>{c.voteQuestion}</legend>
                                {choices(c.voteOptions, vote, setVote, "vote")}
                              </fieldset>
                              <fieldset className="rh-pattern" disabled={!!busy}>
                                <legend>{c.patternQuestion}</legend>
                                {choices(
                                  c.patternOptions,
                                  pattern,
                                  setPattern,
                                  "pattern"
                                )}
                                {!state?.pattern && (
                                  <button
                                    className="rh-link"
                                    disabled={!!busy}
                                    onClick={() => setPattern(null)}
                                  >
                                    {c.clearPattern}
                                  </button>
                                )}
                              </fieldset>
                              <p className="rh-small">{c.conceptNote}</p>
                            </>
                          )}
                          <div className="rh-actions">
                            {step > 0 ? (
                              <button
                                className="button outline"
                                type="button"
                                disabled={!!busy}
                                onClick={() => navigate(step - 1)}
                              >
                                {language === "en" ? (
                                  <ArrowLeft size={16} aria-hidden="true" />
                                ) : (
                                  <ArrowRight size={16} aria-hidden="true" />
                                )}
                                <span>{c.back}</span>
                              </button>
                            ) : (
                              <button
                                className="button outline"
                                type="button"
                                disabled={!!busy || (!!token && !state)}
                                onClick={() => submitStep(true)}
                              >
                                <span>{!token ? c.optinSkip : c.skip}</span>
                                {language === "en" ? (
                                  <ArrowRight size={16} aria-hidden="true" />
                                ) : (
                                  <ArrowLeft size={16} aria-hidden="true" />
                                )}
                              </button>
                            )}
                            <button
                              className="button primary"
                              type="button"
                              disabled={!!busy || (!!token && !state)}
                              onClick={() => submitStep()}
                            >
                              {!token ? c.optinSave : step === 3 ? c.finish : c.save}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                    </>
                  )}
                </div>
                <div className="rh-dialog-footer">
                  {token && !deleteOpen && (
                      <button
                        type="button"
                        ref={deleteTrigger}
                        className="rh-delete-trigger"
                        disabled={!!busy}
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        <span>{c.delete}</span>
                      </button>
                  )}
                  {deleteOpen && (
                    <div
                      className="rh-delete-confirm"
                      role="alertdialog"
                      aria-labelledby={`${id}-delete-title`}
                      aria-describedby={`${id}-delete-description`}
                      dir={language === "en" ? "ltr" : "rtl"}
                    >
                      <div className="rh-delete-confirm-copy">
                        <strong id={`${id}-delete-title`}>{c.deleteTitle}</strong>
                        <p id={`${id}-delete-description`}>{c.deleteBody}</p>
                      </div>
                      <div className="rh-delete-confirm-actions">
                        <button
                          type="button"
                          ref={deleteCancel}
                          className="button outline"
                          disabled={!!busy}
                          onClick={() => {
                            setDeleteOpen(false);
                            requestAnimationFrame(() => deleteTrigger.current?.focus());
                          }}
                        >
                            {c.cancel}
                        </button>
                        <button
                          type="button"
                            className="button primary"
                            disabled={!!busy}
                            onClick={() => {
                              void perform({ kind: "delete" });
                            }}
                          >
                            {busy === "delete" ? c.deleting : c.confirmDelete}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <aside className="rh-progress" aria-label={c.progress}>
          <p className="rh-progress-label">{c.progress}</p>
          <div
            className="rh-score"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
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
          <h3 className="rh-journey-title" id={`${id}-journey-title`}>
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
          {state && (
            <p className="rh-small rh-expiry">
              {c.expiredOn}:{" "}
              <time dateTime={state.expiresAt}>
                {new Intl.DateTimeFormat(
                  language === "fa"
                    ? "fa-AF"
                    : language === "ps"
                      ? "ps-AF"
                      : "en",
                  { year: "numeric", month: "short", day: "numeric" }
                ).format(new Date(state.expiresAt))}
              </time>
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
