import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizeLocale } from "@/lib/locales";
import "./BlackFridayCampaign.css";
import type { SupportedLocale } from "@/lib/locales";
import { COUNTRIES } from "@shared/countries";

const pickLabel: Record<SupportedLocale, string> = {
  fa: "انتخاب شما: ",
  en: "Your pick: ",
  ps: "ستاسو انتخاب: ",
};
const pickColor: Record<"red" | "grey", Record<SupportedLocale, string>> = {
  red: { fa: "سرخ", en: "Red", ps: "سور" },
  grey: { fa: "خاکستری", en: "Grey", ps: "خړ" },
};

function renderRulesCopy() {
  return (
    <p className="rules-copy">
      <span className="fa">
        ۱ دیگ ۱۰٪، ۲ دیگ ۱۵٪ و ۳ دیگ یا بیشتر ۲۰٪ تخفیف. تخفیف روی کل مبلغ سفارش
        اعمال می‌شود. فقط از ۲۷ تا ۳۰ نوامبر ۲۰۲۶. شرایط ممکن است در هر فروشگاه
        متفاوت باشد.
      </span>
      <span className="en">
        1 pot 10% off, 2 pots 15% off, 3 or more pots 20% off. The discount
        applies to your whole order total. Valid November 27–30, 2026 only.
        Terms may differ by store.
      </span>
      <span className="ps">
        ۱ دېګ ۱۰٪، ۲ دېګه ۱۵٪ او ۳ یا ډېر ۲۰٪ تخفیف. تخفیف ستاسو د ټول فرمایش پر
        بیه پلي کېږي. یوازې د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰. شرایط ښايي په هر پلورنځي
        کې توپیر ولري.
      </span>
    </p>
  );
}

function renderRules() {
  return (
    <ul className="rules" aria-label="Black Friday offer terms">
      <li>
        <span className="fa">
          ۱ دیگ ۱۰٪، ۲ دیگ ۱۵٪ و ۳ دیگ یا بیشتر ۲۰٪ تخفیف.
        </span>
        <span className="en">
          1 pot 10% off, 2 pots 15% off, 3 or more pots 20% off.
        </span>
        <span className="ps">۱ دېګ ۱۰٪، ۲ دېګه ۱۵٪ او ۳ یا ډېر ۲۰٪ تخفیف.</span>
      </li>
      <li>
        <span className="fa">تخفیف روی کل مبلغ سفارش اعمال می‌شود.</span>
        <span className="en">
          The discount applies to your whole order total.
        </span>
        <span className="ps">تخفیف ستاسو د ټول فرمایش پر بیه پلي کېږي.</span>
      </li>
      <li>
        <span className="fa">فقط از ۲۷ تا ۳۰ نوامبر ۲۰۲۶.</span>
        <span className="en">Valid November 27–30, 2026 only.</span>
        <span className="ps">یوازې د ۲۰۲۶ د نومبر له ۲۷ تر ۳۰.</span>
      </li>
      <li>
        <span className="fa">شرایط ممکن است در هر فروشگاه متفاوت باشد.</span>
        <span className="en">Terms may differ by store.</span>
        <span className="ps">شرایط ښايي په هر پلورنځي کې توپیر ولري.</span>
      </li>
    </ul>
  );
}

export default function BlackFridayPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();
  const locale: SupportedLocale = normalizeLocale(
    i18n.resolvedLanguage || i18n.language
  );
  const [campaignState, setCampaignState] = useState<"pre" | "live" | "ended">(
    () => {
      const search =
        typeof window === "undefined" ? "" : window.location.search;
      const params = new URLSearchParams(search);
      const override = params.get("state") || params.get("mode");
      if (override === "pre" || override === "live" || override === "ended")
        return override;
      const now = Date.now();
      return now < new Date("2026-11-27T00:00:00-05:00").getTime()
        ? "pre"
        : now < new Date("2026-12-01T00:00:00-05:00").getTime()
          ? "live"
          : "ended";
    }
  );
  const [selectedColor, setSelectedColor] = useState<"red" | "grey">("red");
  const [selectedSize, setSelectedSize] = useState("9");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const track = (event: string, details: Record<string, string> = {}) => {
      const dataLayer = (
        window as Window & { dataLayer?: Array<Record<string, unknown>> }
      ).dataLayer;
      dataLayer?.push({
        event: `rayhana_bf_${event}`,
        campaign_state: root.dataset.state,
        page_language: locale,
        ...details,
      });
    };
    const onTrackedClick = (event: Event) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-track]"
      );
      if (!element) return;
      track(element.dataset.track || "", {
        cta: element.dataset.cta || "",
        store: element.dataset.store || "",
        url: (element as HTMLAnchorElement).href || "",
      });
    };
    root.addEventListener("click", onTrackedClick);
    let chosenState = campaignState;
    const start = new Date("2026-11-27T00:00:00-05:00").getTime();
    const end = new Date("2026-12-01T00:00:00-05:00").getTime();
    const forced = ["pre", "live", "ended"].includes(
      new URLSearchParams(window.location.search).get("state") ||
        new URLSearchParams(window.location.search).get("mode") ||
        ""
    );
    const zone = {
      fa: "به وقت شرق آمریکا (نیویورک)",
      en: "US Eastern Time (New York)",
      ps: "د امریکا ختیځ وخت (نیویارک)",
    }[locale];
    root.querySelectorAll<HTMLElement>(".tzl").forEach(el => {
      el.textContent = zone;
    });
    root
      .querySelectorAll<HTMLInputElement>("[data-placeholder-en]")
      .forEach(input => {
        input.placeholder =
          input.dataset[
            `placeholder${locale[0].toUpperCase()}${locale.slice(1)}`
          ] ||
          input.dataset.placeholderEn ||
          "";
      });

    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const now = Date.now();
      const actual = now < start ? "pre" : now < end ? "live" : "ended";
      if (!forced && actual !== chosenState) {
        chosenState = actual;
        setCampaignState(actual);
      }
      const target = chosenState === "pre" ? start : end;
      const seconds = Math.max(0, Math.floor((target - now) / 1000));
      const values = {
        d: Math.floor(seconds / 86400),
        h: Math.floor((seconds % 86400) / 3600),
        m: Math.floor((seconds % 3600) / 60),
        s: seconds % 60,
      };
      Object.entries(values).forEach(([key, value]) => {
        const el = root.querySelector<HTMLElement>(`[data-cd="${key}"]`);
        if (el) el.textContent = pad(value);
      });
    };
    tick();
    const countdown = window.setInterval(tick, 1000);

    const startTime = new Date("2026-11-27T00:00:00-05:00").getTime();
    const endTime = new Date("2026-12-01T00:00:00-05:00").getTime();
    const makeCalendar = () => {
      const format = (time: number) =>
        new Date(time)
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      const contents = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Rayhana//Black Friday 2026//EN",
        "BEGIN:VEVENT",
        "UID:rayhana-bf-2026@rayhana.com",
        `DTSTAMP:${format(Date.now())}`,
        `DTSTART:${format(startTime)}`,
        `DTEND:${format(endTime)}`,
        "SUMMARY:Rayhana Black Friday — up to 20% off",
        "DESCRIPTION:1 pot 10%\\, 2 pots 15%\\, 3 pots 20% off.",
        "URL:https://rayhana.com/black-friday",
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Rayhana Black Friday starts soon",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([contents], { type: "text/calendar" })
      );
      link.download = "rayhana-black-friday-2026.ics";
      link.click();
      URL.revokeObjectURL(link.href);
    };
    const onCalendar = (event: Event) => {
      if ((event.target as HTMLElement).closest("[data-ics]")) makeCalendar();
    };
    root.addEventListener("click", onCalendar);

    const form = root.querySelector<HTMLFormElement>("#waitlist-form");
    const onSubmit = (event: Event) => {
      event.preventDefault();
      if (!form) return;
      const hasSize = form.querySelector<HTMLInputElement>(
        'input[name="size"]:checked'
      );
      setWaitlistError(!hasSize);
      if (hasSize) setWaitlistSubmitted(true);
    };
    form?.addEventListener("submit", onSubmit);

    const updateSelection = () => {
      const img = root.querySelector<HTMLImageElement>("#p-img");
      if (img) {
        img.dataset.color = selectedColor;
        img.alt = `Rayhana Heritage Pot in ${selectedColor}`;
      }
      const selection = root.querySelector<HTMLElement>("#sel");
      if (selection)
        selection.textContent = `${pickLabel[locale]}${pickColor[selectedColor][locale]} · ${selectedSize} L`;
      root
        .querySelectorAll<HTMLElement>("[data-color]")
        .forEach(el =>
          el.setAttribute(
            "aria-pressed",
            String(el.dataset.color === selectedColor)
          )
        );
      root
        .querySelectorAll<HTMLElement>("[data-size]")
        .forEach(el =>
          el.setAttribute(
            "aria-pressed",
            String(el.dataset.size === selectedSize)
          )
        );
    };
    const onChoice = (event: Event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-color], [data-size]"
      );
      if (!target) return;
      if (target.dataset.color === "red" || target.dataset.color === "grey")
        setSelectedColor(target.dataset.color);
      if (target.dataset.size) setSelectedSize(target.dataset.size);
      track("product_select", {
        color:
          target.dataset.color ||
          root.querySelector<HTMLElement>('[data-color][aria-pressed="true"]')
            ?.dataset.color ||
          selectedColor,
        size:
          target.dataset.size ||
          root.querySelector<HTMLElement>('[data-size][aria-pressed="true"]')
            ?.dataset.size ||
          selectedSize,
      });
    };
    root.addEventListener("click", onChoice);
    updateSelection();
    new Image().src = "/images/rayhana-pot-cutout.webp";

    const onFaq = (event: Event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "#faq-list button[data-q]"
      );
      if (!button) return;
      const key = button.dataset.q || "";
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      root
        .querySelectorAll<HTMLButtonElement>("#faq-list button[data-q]")
        .forEach(item => {
          const isOpen = item === button && willOpen;
          item.setAttribute("aria-expanded", String(isOpen));
          const panel = item.parentElement
            ?.nextElementSibling as HTMLElement | null;
          if (panel) {
            panel.hidden = !isOpen;
            panel.id = `faq-${item.dataset.q}`;
            item.setAttribute("aria-controls", panel.id);
          }
        });

      if (willOpen) track("faq_open", { question: key });
    };
    root.addEventListener("click", onFaq);

    const video = root.querySelector<HTMLVideoElement>("[data-video]");
    const player = video?.closest<HTMLElement>(".video-wrap");
    const playButtons = player?.querySelectorAll<HTMLButtonElement>(
      "[data-video-toggle]"
    );
    const seek = player?.querySelector<HTMLInputElement>("[data-video-seek]");
    const volume = player?.querySelector<HTMLInputElement>(
      "[data-video-volume]"
    );
    const muteButton =
      player?.querySelector<HTMLButtonElement>("[data-video-mute]");
    const fullscreen = player?.querySelector<HTMLButtonElement>(
      "[data-video-fullscreen]"
    );
    const formatTime = (value: number) =>
      Number.isFinite(value)
        ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`
        : "0:00";
    const syncPlay = () => {
      if (!video || !player) return;
      const playing = !video.paused && !video.ended;
      player.dataset.playing = String(playing);
      const playIcon =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>';
      const pauseIcon =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
      playButtons?.forEach(button => {
        button.innerHTML = playing ? pauseIcon : playIcon;
        button.setAttribute(
          "aria-label",
          playing ? "Pause video" : "Play video"
        );
      });
    };
    const syncVolume = () => {
      if (!video || !volume || !muteButton) return;
      const isMuted = video.muted || video.volume === 0;
      muteButton.innerHTML = isMuted
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
      muteButton.setAttribute(
        "aria-label",
        isMuted ? "Unmute video" : "Mute video"
      );
      volume.value = String(video.volume);
      volume.style.setProperty("--progress", `${video.volume * 100}%`);
    };
    const syncTime = () => {
      if (!video || !player) return;
      const current = player.querySelector<HTMLElement>("[data-video-current]");
      const duration = player.querySelector<HTMLElement>(
        "[data-video-duration]"
      );
      if (current) current.textContent = formatTime(video.currentTime);
      if (duration) duration.textContent = formatTime(video.duration);
      if (seek && Number.isFinite(video.duration) && video.duration > 0) {
        seek.value = String(
          Math.round((video.currentTime / video.duration) * 1000)
        );
        seek.style.setProperty(
          "--progress",
          `${(video.currentTime / video.duration) * 100}%`
        );
      }
    };
    const toggleVideo = () => {
      if (!video) return;
      if (video.paused || video.ended) void video.play().catch(syncPlay);
      else video.pause();
    };
    playButtons?.forEach(button =>
      button.addEventListener("click", toggleVideo)
    );
    video?.addEventListener("click", toggleVideo);
    video?.addEventListener("play", syncPlay);
    const onVideoPlay = () => track("video_play");
    video?.addEventListener("play", onVideoPlay);
    video?.addEventListener("pause", syncPlay);
    video?.addEventListener("ended", syncPlay);
    video?.addEventListener("loadedmetadata", syncTime);
    video?.addEventListener("timeupdate", syncTime);
    const onSeek = () => {
      if (video && seek && Number.isFinite(video.duration))
        video.currentTime = (Number(seek.value) / 1000) * video.duration;
    };
    const onVolume = () => {
      if (video && volume) {
        video.volume = Number(volume.value);
        video.muted = video.volume === 0;
        syncVolume();
      }
    };
    const onMute = () => {
      if (video) {
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) video.volume = 0.7;
        syncVolume();
      }
    };
    const onFullscreen = () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else if (player?.requestFullscreen) void player.requestFullscreen();
    };
    seek?.addEventListener("input", onSeek);
    volume?.addEventListener("input", onVolume);
    muteButton?.addEventListener("click", onMute);
    fullscreen?.addEventListener("click", onFullscreen);
    if (video) {
      video.volume = 0.7;
      syncPlay();
      syncVolume();
      syncTime();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.pause();
        video.removeAttribute("autoplay");
      }
    }

    const sticky = root.querySelector<HTMLElement>("#sticky");
    const targets = [
      root.querySelector(".hero"),
      root.querySelector("#buy"),
      root.querySelector(".final"),
    ].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    const observer =
      "IntersectionObserver" in window && sticky
        ? new IntersectionObserver(entries => {
            entries.forEach(entry =>
              entry.isIntersecting
                ? visible.add(entry.target)
                : visible.delete(entry.target)
            );
            sticky.classList.toggle(
              "show",
              targets.every(target => !visible.has(target))
            );
          })
        : null;
    targets.forEach(target => observer?.observe(target));

    return () => {
      window.clearInterval(countdown);
      observer?.disconnect();
      root.removeEventListener("click", onTrackedClick);
      root.removeEventListener("click", onCalendar);
      root.removeEventListener("click", onChoice);
      root.removeEventListener("click", onFaq);
      form?.removeEventListener("submit", onSubmit);
      playButtons?.forEach(button =>
        button.removeEventListener("click", toggleVideo)
      );
      video?.removeEventListener("click", toggleVideo);
      video?.removeEventListener("play", syncPlay);
      video?.removeEventListener("play", onVideoPlay);
      video?.removeEventListener("pause", syncPlay);
      video?.removeEventListener("ended", syncPlay);
      video?.removeEventListener("loadedmetadata", syncTime);
      video?.removeEventListener("timeupdate", syncTime);
      seek?.removeEventListener("input", onSeek);
      volume?.removeEventListener("input", onVolume);
      muteButton?.removeEventListener("click", onMute);
      fullscreen?.removeEventListener("click", onFullscreen);
    };
  }, [locale]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelectorAll<HTMLElement>("[data-color]")
      .forEach(el =>
        el.setAttribute(
          "aria-pressed",
          String(el.dataset.color === selectedColor)
        )
      );
    root
      .querySelectorAll<HTMLElement>("[data-size]")
      .forEach(el =>
        el.setAttribute(
          "aria-pressed",
          String(el.dataset.size === selectedSize)
        )
      );
    const image = root.querySelector<HTMLImageElement>("#p-img");
    if (image) {
      image.dataset.color = selectedColor;
      image.alt = `Rayhana Heritage Pot in ${selectedColor}`;
    }
    const selection = root.querySelector<HTMLElement>("#sel");
    if (selection)
      selection.textContent = `${pickLabel[locale]}${pickColor[selectedColor][locale]} · ${selectedSize} L`;
  }, [locale, selectedColor, selectedSize]);

  return (
    <div
      ref={rootRef}
      className={`bf-campaign min-h-screen w-full lang-${locale}`}
      data-state={campaignState}
      dir={locale === "fa" || locale === "ps" ? "rtl" : "ltr"}
    >
      <a className="skip" href="#main">
        <span className="fa">پرش به محتوا</span>
        <span className="en">Skip to content</span>
        <span className="ps">محتوا ته لاړ شئ</span>
      </a>
      <main id="main" className="w-full">
        <section
          className={"hero"}
          aria-labelledby={"hero-title"}
          style={{ paddingTop: "56px" }}
        >
          <div className={"wrap"}>
            <div className={"hero-grid"}>
              <div>
                <span className={"label"}>
                  <span className={"fa"}>جمعه سیاه ۲۰۲۶</span>
                  <span className={"en"}>Black Friday 2026</span>
                  <span className={"ps"}>تور جمعه ۲۰۲۶</span>
                </span>
                <h1 id={"hero-title"} className={"h-display s-active"}>
                  <span className={"fa"}>
                    هرچه بیشتر بخرید، <em>بیشتر</em> صرفه‌جویی میکنید
                  </span>
                  <span className={"en"}>
                    The more you buy, the <em>more</em> you save
                  </span>
                  <span className={"ps"}>
                    څومره چې ډېر واخلئ، هومره <em>ډېر</em> سپما کوئ
                  </span>
                </h1>
                <h1 className={"h-display s-ended"}>
                  <span className={"fa"}>طعم خانه، در آشپزخانه شما</span>
                  <span className={"en"}>
                    The taste of home, in your kitchen
                  </span>
                  <span className={"ps"}>د کور خوند، ستاسو په پخلنځي کې</span>
                </h1>
                <p className={"lead s-active"}>
                  <span className={"fa"}>
                    جمعه سیاه را با ریحانه جشن بگیرید. طعم آشپزی اصیل افغانی را
                    به خانه بیاورید و با خرید بیشتر، تخفیف بیشتری بگیرید.
                  </span>
                  <span className={"en"}>
                    Celebrate Black Friday with Rayhana. Bring home the
                    traditional Afghan cooking experience and save more when you
                    buy more.
                  </span>
                  <span className={"ps"}>
                    تور جمعه له ریحانه سره ولمانځئ. د افغاني دودیز پخلي خوند کور
                    ته راوړئ او په ډېر پېرود ډېر تخفیف ترلاسه کړئ.
                  </span>
                </p>
                <p className={"dates s-active"}>
                  <span className={"fa"}>
                    ۶ تا ۹ آذر ۱۴۰۵ — ۲۷ تا ۳۰ نوامبر ۲۰۲۶
                  </span>
                  <span className={"en"}>November 27–30, 2026</span>
                  <span className={"ps"}>د ۲۰۲۶ کال د نومبر له ۲۷ تر ۳۰</span>
                  <small className={"tzl"}></small>
                </p>
                <div className={"countbox s-active"}>
                  <span className={"t s-pre"}>
                    <span className={"fa"}>تا شروع تخفیف:</span>
                    <span className={"en"}>Offer starts in:</span>
                    <span className={"ps"}>تر پیل پورې:</span>
                  </span>
                  <span className={"t s-live"}>
                    <span className={"fa"}>تا پایان تخفیف:</span>
                    <span className={"en"}>Offer ends in:</span>
                    <span className={"ps"}>تر پای پورې:</span>
                  </span>
                  <div className={"countdown"} role={"timer"} aria-live={"off"}>
                    <div>
                      <b data-cd={"d"}>00</b>
                      <small>
                        <span className={"fa"}>روز</span>
                        <span className={"en"}>days</span>
                        <span className={"ps"}>ورځې</span>
                      </small>
                    </div>
                    <div>
                      <b data-cd={"h"}>00</b>
                      <small>
                        <span className={"fa"}>ساعت</span>
                        <span className={"en"}>hrs</span>
                        <span className={"ps"}>ساعته</span>
                      </small>
                    </div>
                    <div>
                      <b data-cd={"m"}>00</b>
                      <small>
                        <span className={"fa"}>دقیقه</span>
                        <span className={"en"}>min</span>
                        <span className={"ps"}>دقیقې</span>
                      </small>
                    </div>
                    <div>
                      <b data-cd={"s"}>00</b>
                      <small>
                        <span className={"fa"}>ثانیه</span>
                        <span className={"en"}>sec</span>
                        <span className={"ps"}>ثانیې</span>
                      </small>
                    </div>
                  </div>
                </div>
                <div className={"ended-box s-ended"} role={"status"}>
                  <strong>
                    <span className={"fa"}>تخفیف جمعه سیاه به پایان رسید.</span>
                    <span className={"en"}>
                      The Black Friday offer has ended.
                    </span>
                    <span className={"ps"}>
                      د تورې جمعې تخفیف پای ته ورسېد.
                    </span>
                  </strong>
                  <p style={{ color: "var(--muted)" }}>
                    <span className={"fa"}>
                      از همراهی شما سپاسگزاریم. دیگ‌های ریحانه همچنان با قیمت
                      عادی در دسترس است.
                    </span>
                    <span className={"en"}>
                      Thank you for joining us. Rayhana pots are still available
                      at regular prices.
                    </span>
                    <span className={"ps"}>
                      ستاسو د ملګرتیا مننه. د ریحانه دېګونه اوس هم په عادي بیه
                      شته.
                    </span>
                  </p>
                </div>
                <div className={"hero-cta"}>
                  <a
                    className={"btn btn-red s-pre"}
                    href={"#waitlist"}
                    data-track={"cta_click"}
                    data-cta={"hero_waitlist"}
                  >
                    <span className={"fa"}>ثبت‌نام در فهرست انتظار</span>
                    <span className={"en"}>Join the waitlist</span>
                    <span className={"ps"}>د انتظار نوملړ ته ورشئ</span>
                  </a>
                  <a
                    className={"btn btn-red s-live"}
                    href={"#pots"}
                    data-track={"cta_click"}
                    data-cta={"hero_shop"}
                  >
                    <span className={"fa"}>انتخاب دیگ و خرید</span>
                    <span className={"en"}>Choose your pot</span>
                    <span className={"ps"}>خپل دېګ وټاکئ</span>
                  </a>
                  <button
                    className={"btn btn-ghost s-pre"}
                    type={"button"}
                    data-ics={""}
                    data-track={"cta_click"}
                    data-cta={"hero_calendar"}
                  >
                    <span className={"fa"}>افزودن به تقویم</span>
                    <span className={"en"}>Add to calendar</span>
                    <span className={"ps"}>کلیز ته یې ور زیات کړئ</span>
                  </button>
                  <a
                    className={"btn btn-red s-ended"}
                    href={"https://rayhana.com/products"}
                    data-track={"outbound_click"}
                    data-store={"rayhana_products"}
                  >
                    <span className={"fa"}>خرید از ریحانه</span>
                    <span className={"en"}>Shop Rayhana</span>
                    <span className={"ps"}>له ریحانه واخلئ</span>
                  </a>
                </div>
              </div>
              <figure className={"hero-photo"}>
                <img
                  src={"/images/rayhana-pot-cutout.webp"}
                  width={"2000"}
                  height={"2000"}
                  fetchPriority={"high"}
                  alt={
                    "Rayhana Qabili pilaf pot in red with lid and black heat-resistant handles"
                  }
                />
              </figure>
            </div>
            <div className={"s-active"}>
              <div
                className={"tiers"}
                role={"list"}
                aria-label={"Discount tiers"}
              >
                <div className={"tier"} role={"listitem"}>
                  <div className={"qty"}>
                    <span className={"fa"}>خرید ۱ دیگ</span>
                    <span className={"en"}>Buy 1 pot</span>
                    <span className={"ps"}>۱ دېګ واخلئ</span>
                  </div>
                  <div className={"pct"}>10%</div>
                  <div className={"off"}>
                    <span className={"fa"}>تخفیف</span>
                    <span className={"en"}>off</span>
                    <span className={"ps"}>تخفیف</span>
                  </div>
                </div>
                <div className={"tier"} role={"listitem"}>
                  <div className={"qty"}>
                    <span className={"fa"}>خرید ۲ دیگ</span>
                    <span className={"en"}>Buy 2 pots</span>
                    <span className={"ps"}>۲ دېګونه واخلئ</span>
                  </div>
                  <div className={"pct"}>15%</div>
                  <div className={"off"}>
                    <span className={"fa"}>تخفیف</span>
                    <span className={"en"}>off</span>
                    <span className={"ps"}>تخفیف</span>
                  </div>
                </div>
                <div className={"tier best"} role={"listitem"}>
                  <span className={"badge"}>
                    <span className={"fa"}>بهترین پیشنهاد</span>
                    <span className={"en"}>Best deal</span>
                    <span className={"ps"}>غوره وړاندیز</span>
                  </span>
                  <div className={"qty"}>
                    <span className={"fa"}>خرید ۳ دیگ</span>
                    <span className={"en"}>Buy 3 pots</span>
                    <span className={"ps"}>۳ دېګونه واخلئ</span>
                  </div>
                  <div className={"pct"}>20%</div>
                  <div className={"off"}>
                    <span className={"fa"}>تخفیف</span>
                    <span className={"en"}>off</span>
                    <span className={"ps"}>تخفیف</span>
                  </div>
                </div>
              </div>
              {renderRules()}
            </div>
          </div>
        </section>
        <section
          className={"video"}
          id={"video"}
          aria-labelledby={"video-title"}
        >
          <div className={"wrap"}>
            <div className={"sec-head center"}>
              <h2 id={"video-title"} className={"h-display"}>
                <span className={"fa"}>ریحانه را از نزدیک ببینید</span>
                <span className={"en"}>See Rayhana up close</span>
                <span className={"ps"}>ریحانه له نږدې وګورئ</span>
              </h2>
              <p>
                <span className={"fa"}>
                  شکل، درب و جزئیات دیگ را پیش از خرید ببینید.
                </span>
                <span className={"en"}>
                  Take a closer look at the shape, the lid and the details
                  before you buy.
                </span>
                <span className={"ps"}>
                  له پېرود مخکې د دېګ بڼه، سرپوښ او جزئیات وګورئ.
                </span>
              </p>
            </div>
            <div className={"video-wrap"}>
              <video
                autoPlay={true}
                muted={true}
                loop={true}
                playsInline={true}
                preload={"metadata"}
                width={"1280"}
                height={"720"}
                poster={
                  "https://res.cloudinary.com/ezsafryd/video/upload/so_2,w_1280,q_auto,f_jpg/v1793692763/Videos2026-11-03_110720_071.jpg"
                }
                src={
                  "https://res.cloudinary.com/ezsafryd/video/upload/v1793692763/Videos2026-11-03_110720_071.mp4"
                }
                aria-label={"Rayhana pot product video"}
                data-video={""}
              ></video>
              <button
                className={"video-center-play"}
                type={"button"}
                data-video-toggle={""}
                aria-label={"Play video"}
              >
                <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                  <path d={"M8 5.5v13l10-6.5z"}></path>
                </svg>
              </button>
              <div
                className={"video-controls"}
                role={"group"}
                aria-label={"Video controls"}
              >
                <button
                  className={"video-control-btn"}
                  type={"button"}
                  data-video-toggle={""}
                  aria-label={"Pause video"}
                >
                  <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                    <path d={"M8 5v14M16 5v14"}></path>
                  </svg>
                </button>
                <div className={"video-time"}>
                  <span data-video-current={""}>0:00</span>
                  <span aria-hidden={"true"}>/</span>
                  <span data-video-duration={""}>0:00</span>
                </div>
                <input
                  className={"video-seek"}
                  type={"range"}
                  min={"0"}
                  max={"1000"}
                  value={"0"}
                  step={"1"}
                  aria-label={"Seek video"}
                  data-video-seek={""}
                />
                <button
                  className={"video-control-btn"}
                  type={"button"}
                  data-video-mute={""}
                  aria-label={"Unmute video"}
                >
                  <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                    <path d={"M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"}></path>
                  </svg>
                </button>
                <input
                  className={"video-volume"}
                  type={"range"}
                  min={"0"}
                  max={"1"}
                  value={"0.7"}
                  step={"0.05"}
                  aria-label={"Volume"}
                  data-video-volume={""}
                />
                <button
                  className={"video-control-btn"}
                  type={"button"}
                  data-video-fullscreen={""}
                  aria-label={"Enter fullscreen"}
                >
                  <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                    <path
                      d={
                        "M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"
                      }
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section id={"pots"} aria-labelledby={"pots-title"}>
          <div className={"wrap"}>
            <div className={"sec-head"}>
              <span className={"label"}>
                <span className={"fa"}>دیگ خود را انتخاب کنید</span>
                <span className={"en"}>Choose your Rayhana pot</span>
                <span className={"ps"}>خپل دېګ وټاکئ</span>
              </span>
              <h2 id={"pots-title"} className={"h-display"}>
                <span className={"fa"}>یک دیگ، سه اندازه، دو رنگ</span>
                <span className={"en"}>One pot. Three sizes. Two colours.</span>
                <span className={"ps"}>یو دېګ، درې اندازې، دوه رنګونه</span>
              </h2>
              <p>
                <span className={"fa"}>
                  اندازه را بر اساس تعداد افراد خانواده‌تان انتخاب کنید.
                </span>
                <span className={"en"}>
                  Pick the size by how many people you usually cook for.
                </span>
                <span className={"ps"}>
                  اندازه د هغو کسانو د شمېر له مخې وټاکئ چې ورته پخلی کوئ.
                </span>
              </p>
            </div>
            <div className={"chooser"}>
              <div className={"p-photo"}>
                <img
                  id={"p-img"}
                  data-color={"red"}
                  src={"/images/rayhana-pot-cutout.webp"}
                  width={"2000"}
                  height={"2000"}
                  loading={"lazy"}
                  decoding={"async"}
                  alt={"Rayhana Heritage Pot in red"}
                />
              </div>
              <div>
                <h3 className={"p-name"}>
                  <span className={"fa"}>دیگ مخصوص پلو و قورمه ریحانه</span>
                  <span className={"en"}>Rayhana Heritage Pot</span>
                  <span className={"ps"}>د ریحانه قابلي پلو دیګ</span>
                </h3>
                <p className={"p-desc"}>
                  <span className={"fa"}>
                    طراحی شده برای پخت قابلی پلو اصیل و غذاهای سنتی افغانستان.
                    پوشش نچسب با قابلیت حفظ طعم و عطر غذا، مناسب برای دم کردن
                    برنج.
                  </span>
                  <span className={"en"}>
                    Designed for authentic Qabili Palaw and traditional Afghan
                    dishes. A non-stick coating that keeps the taste and aroma,
                    made for steaming rice.
                  </span>
                  <span className={"ps"}>
                    د اصیل قابلي پلو او افغاني دودیزو خوړو لپاره جوړ شوی. نه
                    نښلېدونکی پوښ چې د خوړو خوند او بوی ساتي، د وريجو دم کولو
                    لپاره مناسب.
                  </span>
                </p>
                <div className={"opt-title"} id={"c-lbl"}>
                  <span className={"fa"}>رنگ</span>
                  <span className={"en"}>Colour</span>
                  <span className={"ps"}>رنګ</span>
                </div>
                <div
                  className={"colors"}
                  role={"group"}
                  aria-labelledby={"c-lbl"}
                >
                  <button
                    type={"button"}
                    data-color={"red"}
                    aria-pressed={"true"}
                  >
                    <i style={{ background: "#B8202A" }}></i>
                    <span className={"fa"}>سرخ</span>
                    <span className={"en"}>Red</span>
                    <span className={"ps"}>سور</span>
                  </button>
                  <button
                    type={"button"}
                    data-color={"grey"}
                    aria-pressed={"false"}
                  >
                    <i style={{ background: "#6E6E70" }}></i>
                    <span className={"fa"}>خاکستری</span>
                    <span className={"en"}>Grey</span>
                    <span className={"ps"}>خړ</span>
                  </button>
                </div>
                <div className={"opt-title"} id={"s-lbl"}>
                  <span className={"fa"}>اندازه</span>
                  <span className={"en"}>Size</span>
                  <span className={"ps"}>اندازه</span>
                </div>
                <div
                  className={"sizes"}
                  role={"group"}
                  aria-labelledby={"s-lbl"}
                >
                  <button
                    type={"button"}
                    data-size={"7"}
                    aria-pressed={"false"}
                  >
                    <span className={"l ltr"}>7 L</span>
                    <span className={"s"}>
                      <span className={"fa"}>۴ تا ۶ نفر</span>
                      <span className={"en"}>4–6 people</span>
                      <span className={"ps"}>۴–۶ کسان</span>
                    </span>
                    <span className={"pr"}>$109.99</span>
                  </button>
                  <button type={"button"} data-size={"9"} aria-pressed={"true"}>
                    <span className={"l ltr"}>9 L</span>
                    <span className={"s"}>
                      <span className={"fa"}>۶ تا ۸ نفر</span>
                      <span className={"en"}>6–8 people</span>
                      <span className={"ps"}>۶–۸ کسان</span>
                    </span>
                    <span className={"pr"}>$129.99</span>
                  </button>
                  <button
                    type={"button"}
                    data-size={"12"}
                    aria-pressed={"false"}
                  >
                    <span className={"l ltr"}>12 L</span>
                    <span className={"s"}>
                      <span className={"fa"}>۸ تا ۱۲ نفر</span>
                      <span className={"en"}>8–12 people</span>
                      <span className={"ps"}>۸–۱۲ کسان</span>
                    </span>
                    <span className={"pr"}>$149.99</span>
                  </button>
                </div>
                <p className={"note"}>
                  <span className={"fa"}>
                    قیمت‌های فهرست‌شده در rayhana.com به دلار آمریکا، پیش از
                    تخفیف. قیمت هر فروشگاه ممکن است متفاوت باشد.
                  </span>
                  <span className={"en"}>
                    Regular list prices on rayhana.com in USD, before discount.
                    Prices vary by store and country.
                  </span>
                  <span className={"ps"}>
                    په rayhana.com کې عادي بیې په امریکايي ډالر، له تخفیف مخکې.
                    بیې د هر پلورنځي او هېواد له مخې توپیر لري.
                  </span>
                </p>
                <dl className={"specs"}>
                  <div>
                    <dt>
                      <span className={"fa"}>بدنه</span>
                      <span className={"en"}>Body</span>
                      <span className={"ps"}>بدنه</span>
                    </dt>
                    <dd>
                      <span className={"fa"}>آلومینیوم دایکاست</span>
                      <span className={"en"}>Die-cast aluminium</span>
                      <span className={"ps"}>ډای‌کاسټ المونیم</span>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <span className={"fa"}>پوشش داخلی</span>
                      <span className={"en"}>Interior</span>
                      <span className={"ps"}>داخلي پوښ</span>
                    </dt>
                    <dd>
                      <span className={"fa"}>نچسب، بدون PFOA و PFAS</span>
                      <span className={"en"}>
                        Non-stick, PFOA &amp; PFAS free
                      </span>
                      <span className={"ps"}>
                        نه نښلېدونکی، بې PFOA او PFAS
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <span className={"fa"}>اجاق‌ها</span>
                      <span className={"en"}>Cooktops</span>
                      <span className={"ps"}>بخارۍ</span>
                    </dt>
                    <dd>
                      <span className={"fa"}>
                        گازی، برقی، سرامیکی، القایی و فر
                      </span>
                      <span className={"en"}>
                        Gas, electric, ceramic, induction, oven
                      </span>
                      <span className={"ps"}>
                        ګاز، برقي، سیرامیک، انډکشن او تنور
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <span className={"fa"}>گارانتی</span>
                      <span className={"en"}>Warranty</span>
                      <span className={"ps"}>ضمانت</span>
                    </dt>
                    <dd>
                      <span className={"fa"}>یک سال</span>
                      <span className={"en"}>One year</span>
                      <span className={"ps"}>یو کال</span>
                    </dd>
                  </div>
                </dl>
                <p className="sel" aria-live="polite">
                  {pickLabel[locale]}
                  {pickColor[selectedColor][locale]} · {selectedSize} L
                </p>
                <div className={"hero-cta"} style={{ marginTop: "16px" }}>
                  <a
                    className={"btn btn-red"}
                    href={"#buy"}
                    data-track={"cta_click"}
                    data-cta={"product_buy"}
                  >
                    <span className={"fa"}>انتخاب فروشگاه</span>
                    <span className={"en"}>Choose where to buy</span>
                    <span className={"ps"}>د پېرود ځای وټاکئ</span>
                  </a>
                </div>
                <p className={"note"}>
                  <span className={"fa"}>
                    رنگ و اندازه را در صفحه فروشگاه دوباره انتخاب کنید.
                  </span>
                  <span className={"en"}>
                    You'll confirm size and colour on the store page.
                  </span>
                  <span className={"ps"}>
                    رنګ او اندازه د پلورنځي په پاڼه کې بیا وټاکئ.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className={"story"} aria-labelledby={"story-title"}>
          <div className={"wrap story-grid"}>
            <figure>
              <img
                src={
                  "https://res.cloudinary.com/ds4pfbv9i/image/upload/f_auto,q_auto,w_1100/v1771806620/Image_2_fqjvjb.png"
                }
                srcSet={
                  "https://res.cloudinary.com/ds4pfbv9i/image/upload/f_auto,q_auto,w_700/v1771806620/Image_2_fqjvjb.png 700w, https://res.cloudinary.com/ds4pfbv9i/image/upload/f_auto,q_auto,w_1100/v1771806620/Image_2_fqjvjb.png 1100w"
                }
                sizes={"(max-width:900px) 100vw, 640px"}
                width={"1100"}
                height={"674"}
                loading={"lazy"}
                decoding={"async"}
                alt={
                  "Qabili Palaw with carrots and raisins in a grey Rayhana pot, next to salad, silicone spatulas and handle covers"
                }
              />
            </figure>
            <div>
              <span className={"label"}>
                <span className={"fa"}>طعم خانه</span>
                <span className={"en"}>The taste of home</span>
                <span className={"ps"}>د کور خوند</span>
              </span>
              <h2
                id={"story-title"}
                className={"sec-head h-display"}
                style={{
                  margin: "10px 0 0",
                  fontSize: "clamp(1.8rem,3.6vw,2.7rem)",
                  fontWeight: "900",
                  lineHeight: "1.25",
                }}
              >
                <span className={"fa"}>
                  طعم خانه را به آشپزخانه‌تان بیاورید
                </span>
                <span className={"en"}>
                  Bring the taste of home to your kitchen
                </span>
                <span className={"ps"}>د کور خوند خپل پخلنځي ته راوړئ</span>
              </h2>
              <blockquote>
                <span className={"fa"}>
                  از دورهمی‌های خانوادگی تا جشن‌ها، قابلی پلو همیشه بیشتر از یک
                  غذا بوده است؛ خانواده را دور یک دسترخوان جمع می‌کند. ریحانه
                  آشپزی سنتی افغانی را به آشپزخانه‌های امروزی می‌آورد، هر جا که
                  خانه باشد.
                </span>
                <span className={"en"}>
                  From family gatherings to special celebrations, Qabili Palaw
                  has always been more than a meal. It brings families together.
                  Rayhana brings the traditional Afghan cooking experience into
                  modern kitchens, wherever home may be.
                </span>
                <span className={"ps"}>
                  له کورنیو غونډو نیولې تر لمانځنو پورې، قابلي پلو تل له یوه
                  خوړو ډېر څه و؛ کورنۍ د یوه دسترخوان شاوخوا راټولوي. ریحانه
                  افغاني دودیز پخلی نننیو پخلنځیو ته راوړي، کور چې هر چېرې وي.
                </span>
              </blockquote>
              <p className={"cap"}>
                <span className={"fa"}>
                  قابلی پلو در دیگ ریحانه، همراه با کفگیر و گوش‌گیرهای سیلیکونی
                  داخل بسته.
                </span>
                <span className={"en"}>
                  Qabili Palaw in a Rayhana pot, with the silicone spatula and
                  handle covers from the box.
                </span>
                <span className={"ps"}>
                  قابلي پلو د ریحانه په دېګ کې، د بستې له سیلیکوني کفګیر او
                  لاس‌نیونکو سره.
                </span>
              </p>
            </div>
          </div>
        </section>
        <section
          className={"waitlist s-pre"}
          id={"waitlist"}
          aria-labelledby={"waitlist-title"}
        >
          <div className={"wrap"}>
            <div className={"waitlist-card"}>
              <div className={"sec-head center"}>
                <span className={"label"}>
                  <span className={"fa"}>دسترسی زودهنگام</span>
                  <span className={"en"}>Early access</span>
                  <span className={"ps"}>ژر لاسرسی</span>
                </span>
                <h2 id={"waitlist-title"} className={"h-display"}>
                  <span className={"fa"}>
                    برای تخفیف جمعه سیاه در فهرست انتظار باشید
                  </span>
                  <span className={"en"}>Get early access to Black Friday</span>
                  <span className={"ps"}>
                    د تورې جمعې وړاندیز ته ژر لاسرسی ومومئ
                  </span>
                </h2>
                <p>
                  <span className={"fa"}>
                    اطلاعات خود را وارد کنید تا پیش از آغاز کمپین به شما اطلاع
                    دهیم.
                  </span>
                  <span className={"en"}>
                    Tell us how to reach you and which pot sizes you’re
                    interested in.
                  </span>
                  <span className={"ps"}>
                    خپل د اړیکې معلومات او د خوښې دېګ اندازه وټاکئ.
                  </span>
                </p>
              </div>
              <form className={"waitlist-form"} id={"waitlist-form"}>
                <label className={"waitlist-field"} htmlFor={"waitlist-name"}>
                  <span className={"fa"}>نام کامل</span>
                  <span className={"en"}>Full name</span>
                  <span className={"ps"}>بشپړ نوم</span>
                  <input
                    id={"waitlist-name"}
                    name={"fullName"}
                    type={"text"}
                    autoComplete={"name"}
                    required={true}
                    placeholder={"Full name"}
                    data-placeholder-en={"Full name"}
                    data-placeholder-fa={"نام کامل"}
                    data-placeholder-ps={"بشپړ نوم"}
                  />
                </label>
                <label className={"waitlist-field"} htmlFor={"waitlist-email"}>
                  <span className={"fa"}>ایمیل</span>
                  <span className={"en"}>Email</span>
                  <span className={"ps"}>برېښنالیک</span>
                  <input
                    id={"waitlist-email"}
                    name={"email"}
                    type={"email"}
                    autoComplete={"email"}
                    dir={"ltr"}
                    required={true}
                    placeholder={"you@example.com"}
                  />
                </label>
                <label
                  className={"waitlist-field"}
                  htmlFor={"waitlist-whatsapp"}
                >
                  <span className={"fa"}>شماره واتساپ</span>
                  <span className={"en"}>WhatsApp number</span>
                  <span className={"ps"}>د واټس‌اپ شمېره</span>
                  <input
                    id={"waitlist-whatsapp"}
                    name={"whatsapp"}
                    type={"tel"}
                    autoComplete={"tel"}
                    dir={"ltr"}
                    required={true}
                    placeholder={"+1 555 123 4567"}
                  />
                </label>
                <label
                  className={"waitlist-field"}
                  htmlFor={"waitlist-country"}
                >
                  <span className={"fa"}>کشور</span>
                  <span className={"en"}>Country</span>
                  <span className={"ps"}>هېواد</span>
                  <select
                    id={"waitlist-country"}
                    name={"country"}
                    autoComplete={"country-name"}
                    defaultValue={""}
                    required={true}
                  >
                    <option value="">
                      {
                        {
                          fa: "کشور را انتخاب کنید",
                          en: "Select your country",
                          ps: "خپل هېواد وټاکئ",
                        }[locale]
                      }
                    </option>
                    {COUNTRIES.map(([code, fa, en, ps]) => (
                      <option key={code} value={code}>
                        {{ fa, en, ps }[locale]}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className={"waitlist-sizes waitlist-wide"}>
                  <legend>
                    <span className={"fa"}>اندازه دیگ (یک یا چند مورد)</span>
                    <span className={"en"}>
                      Pot size(s) · Select all that apply
                    </span>
                    <span className={"ps"}>د دېګ اندازه · یوه یا څو وټاکئ</span>
                  </legend>
                  <div className={"waitlist-size-options"}>
                    <label className={"waitlist-size"}>
                      <input type={"checkbox"} name={"size"} value={"7 L"} />
                      <span>7 L</span>
                    </label>
                    <label className={"waitlist-size"}>
                      <input type={"checkbox"} name={"size"} value={"9 L"} />
                      <span>9 L</span>
                    </label>
                    <label className={"waitlist-size"}>
                      <input type={"checkbox"} name={"size"} value={"12 L"} />
                      <span>12 L</span>
                    </label>
                  </div>
                  <p
                    className={"waitlist-error"}
                    data-waitlist-error={""}
                    hidden={!waitlistError}
                  >
                    <span className={"fa"}>
                      لطفاً دست‌کم یک اندازه را انتخاب کنید.
                    </span>
                    <span className={"en"}>
                      Please select at least one size.
                    </span>
                    <span className={"ps"}>
                      لطفاً لږ تر لږه یوه اندازه وټاکئ.
                    </span>
                  </p>
                </fieldset>
                <div
                  className={"waitlist-wide flex flex-wrap items-center gap-4"}
                >
                  <button
                    className={"btn btn-red waitlist-submit"}
                    type={"submit"}
                  >
                    <span className={"fa"}>ثبت‌نام در فهرست انتظار</span>
                    <span className={"en"}>Join the waitlist</span>
                    <span className={"ps"}>د انتظار نوملړ ته ورشئ</span>
                  </button>
                  <p className={"waitlist-note"}>
                    <span className={"fa"}>
                      این فرم فعلاً نمایشی است؛ اطلاعات ارسال یا ذخیره نمی‌شود.
                    </span>
                    <span className={"en"}>
                      This is a preview form. Your details won’t be sent or
                      saved.
                    </span>
                    <span className={"ps"}>
                      دا د فورمې مخکتنه ده. ستاسو معلومات نه لېږل کېږي او نه
                      ساتل کېږي.
                    </span>
                  </p>
                  <p
                    className={"waitlist-status"}
                    data-waitlist-status={""}
                    role={"status"}
                    hidden={!waitlistSubmitted}
                  >
                    <span className={"fa"}>
                      فرم فعلاً به فهرست انتظار متصل نیست؛ اطلاعات شما ارسال یا
                      ذخیره نشد.
                    </span>
                    <span className={"en"}>
                      The waitlist isn’t connected yet; your details weren’t
                      sent or saved.
                    </span>
                    <span className={"ps"}>
                      د انتظار نوملړ لا نه دی نښلول شوی؛ ستاسو معلومات ونه لېږل
                      شول او ونه ساتل شول.
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section id={"why"} aria-labelledby={"why-title"}>
          <div className={"wrap"}>
            <div className={"sec-head"}>
              <span className={"label"}>
                <span className={"fa"}>چرا ریحانه؟</span>
                <span className={"en"}>Why Rayhana?</span>
                <span className={"ps"}>ولې ریحانه؟</span>
              </span>
              <h2 id={"why-title"} className={"h-display"}>
                <span className={"fa"}>
                  ساخته‌شده برای قابلی پلو، نه فقط یک دیگ نچسب
                </span>
                <span className={"en"}>
                  Made for Qabili Palaw, not just another non-stick pot
                </span>
                <span className={"ps"}>
                  د قابلي پلو لپاره جوړ شوی، نه یوازې یو بل نه نښلېدونکی دېګ
                </span>
              </h2>
            </div>
            <div className={"benefits"}>
              <div className={"benefit"}>
                <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                  <path d={"M3 11h18a9 9 0 0 1-18 0Z"}></path>
                  <path
                    d={
                      "M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5"
                    }
                  ></path>
                </svg>
                <h3>
                  <span className={"fa"}>آشپزی اصیل افغانی</span>
                  <span className={"en"}>Authentic Afghan cooking</span>
                  <span className={"ps"}>اصیل افغاني پخلی</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    برای قابلی پلو، غذاهای سنتی و مهمانی‌های بزرگ خانوادگی طراحی
                    شده است.
                  </span>
                  <span className={"en"}>
                    Designed for Qabili Palaw, traditional Afghan dishes and
                    large family gatherings.
                  </span>
                  <span className={"ps"}>
                    د قابلي پلو، دودیزو خوړو او لویو کورنیو مېلمستیاوو لپاره جوړ
                    شوی.
                  </span>
                </p>
              </div>
              <div className={"benefit"}>
                <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                  <circle cx={"12"} cy={"12"} r={"9"}></circle>
                  <path d={"M8 12.5l2.5 2.5L16 9.5"}></path>
                </svg>
                <h3>
                  <span className={"fa"}>پوشش نچسب</span>
                  <span className={"en"}>Non-stick coating</span>
                  <span className={"ps"}>نه نښلېدونکی پوښ</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    غذا به کف دیگ نمی‌چسبد و شستشو ساده‌تر است. قابل شستشو در
                    ماشین ظرفشویی.
                  </span>
                  <span className={"en"}>
                    Food releases from the base and cleaning is simpler.
                    Dishwasher safe.
                  </span>
                  <span className={"ps"}>
                    خواړه تل ته نه نښلي او مینځل یې اسانه دي. په ماشین کې د
                    مینځلو وړ.
                  </span>
                </p>
              </div>
              <div className={"benefit"}>
                <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                  <path
                    d={
                      "M4 18h16M7 14c0-2 2-2 2-4s-2-2-2-4M12 14c0-2 2-2 2-4s-2-2-2-4M17 14c0-2 2-2 2-4s-2-2-2-4"
                    }
                  ></path>
                </svg>
                <h3>
                  <span className={"fa"}>حرارت یکنواخت</span>
                  <span className={"en"}>Even heat</span>
                  <span className={"ps"}>برابره تودوخه</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    بدنه آلومینیومی گرما را یکنواخت پخش می‌کند. با کف القایی،
                    روی همه اجاق‌ها و داخل فر.
                  </span>
                  <span className={"en"}>
                    The aluminium body spreads heat evenly. Induction base,
                    works on every cooktop and in the oven.
                  </span>
                  <span className={"ps"}>
                    المونیمي بدنه تودوخه برابره خپروي. انډکشن تل لري، په ټولو
                    بخاریو او تنور کې کار کوي.
                  </span>
                </p>
              </div>
              <div className={"benefit"}>
                <svg viewBox={"0 0 24 24"} aria-hidden={"true"}>
                  <rect
                    x={"3"}
                    y={"7"}
                    width={"18"}
                    height={"13"}
                    rx={"2"}
                  ></rect>
                  <path d={"M3 11h18M9 7V4h6v3"}></path>
                </svg>
                <h3>
                  <span className={"fa"}>همه‌چیز داخل جعبه</span>
                  <span className={"en"}>Everything in the box</span>
                  <span className={"ps"}>هر څه په بسته کې</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    دیگ، کفگیر سیلیکونی، دو گوش‌گیر سیلیکونی، مگنت یادبود شهرهای
                    باستانی و دفترچه راهنما.
                  </span>
                  <span className={"en"}>
                    The pot, a silicone spatula, two silicone handle covers, an
                    ancient-cities souvenir magnet and a user manual.
                  </span>
                  <span className={"ps"}>
                    دېګ، سیلیکوني کفګیر، دوه سیلیکوني لاس‌نیونکي، د تاریخي
                    ښارونو مګنیټ او لارښود.
                  </span>
                </p>
              </div>
            </div>
            <div className={"trust"} aria-label={"Product facts"}>
              <span>
                <span className={"fa"}>۱ سال گارانتی</span>
                <span className={"en"}>1-year warranty</span>
                <span className={"ps"}>۱ کال ضمانت</span>
              </span>
              <span>
                <span className={"fa"}>سازگار با اجاق القایی</span>
                <span className={"en"}>Induction compatible</span>
                <span className={"ps"}>له انډکشن سره سمون</span>
              </span>
              <span>
                PFOA · PFAS · <span className={"fa"}>بدون سرب و کادمیوم</span>
                <span className={"en"}>lead &amp; cadmium free</span>
                <span className={"ps"}>بې سرب او کادمیوم</span>
              </span>
              <span>
                <span className={"fa"}>گواهی SGS</span>
                <span className={"en"}>SGS certified</span>
                <span className={"ps"}>د SGS تصدیق</span>
              </span>
            </div>
          </div>
        </section>
        <section className={"reviews"} aria-labelledby={"rev-title"}>
          <div className={"wrap"}>
            <div className={"sec-head center"}>
              <span className={"label"}>
                <span className={"fa"}>نظر مشتریان</span>
                <span className={"en"}>Customer reviews</span>
                <span className={"ps"}>د پېرودونکو نظرونه</span>
              </span>
              <h2 id={"rev-title"} className={"h-display"}>
                <span className={"fa"}>از زبان خریداران بخوانید</span>
                <span className={"en"}>
                  Hear it from people who cook with it
                </span>
                <span className={"ps"}>له هغو یې واورئ چې پرې پخلی کوي</span>
              </h2>
              <p>
                <span className={"fa"}>
                  نظرات تأییدشده خریداران را مستقیم در صفحه محصول آمازون
                  بخوانید.
                </span>
                <span className={"en"}>
                  Read verified buyer reviews directly on our Amazon listings.
                </span>
                <span className={"ps"}>
                  د پېرودونکو تایید شوي نظرونه مستقیم د امازون په پاڼه کې ولولئ.
                </span>
              </p>
            </div>
            <div className={"rev-grid"} id={"rev-grid"}></div>
            <div className={"rev-links"}>
              <a
                className={"btn btn-ghost"}
                href={"https://www.amazon.com/dp/B0GDWXN2ZK#customerReviews"}
                target={"_blank"}
                rel={"noopener"}
                data-track={"outbound_click"}
                data-store={"amazon_us_reviews"}
              >
                Amazon US{" "}
                <svg
                  className={"external-icon"}
                  viewBox={"0 0 24 24"}
                  aria-hidden={"true"}
                >
                  <path d={"M7 17 17 7M7 7h10v10"}></path>
                </svg>
              </a>
              <a
                className={"btn btn-ghost"}
                href={"https://www.amazon.ca/dp/B0GDWM1PZV#customerReviews"}
                target={"_blank"}
                rel={"noopener"}
                data-track={"outbound_click"}
                data-store={"amazon_ca_reviews"}
              >
                Amazon CA{" "}
                <svg
                  className={"external-icon"}
                  viewBox={"0 0 24 24"}
                  aria-hidden={"true"}
                >
                  <path d={"M7 17 17 7M7 7h10v10"}></path>
                </svg>
              </a>
              <a
                className={"btn btn-ghost"}
                href={"https://www.amazon.com.au/dp/B0GDWR2TND#customerReviews"}
                target={"_blank"}
                rel={"noopener"}
                data-track={"outbound_click"}
                data-store={"amazon_au_reviews"}
              >
                Amazon AU{" "}
                <svg
                  className={"external-icon"}
                  viewBox={"0 0 24 24"}
                  aria-hidden={"true"}
                >
                  <path d={"M7 17 17 7M7 7h10v10"}></path>
                </svg>
              </a>
              <a
                className={"btn btn-ghost"}
                href={"https://www.instagram.com/rayhanafamily/"}
                target={"_blank"}
                rel={"noopener"}
                data-track={"outbound_click"}
                data-store={"instagram"}
              >
                Instagram{" "}
                <svg
                  className={"external-icon"}
                  viewBox={"0 0 24 24"}
                  aria-hidden={"true"}
                >
                  <path d={"M7 17 17 7M7 7h10v10"}></path>
                </svg>
              </a>
            </div>
          </div>
        </section>
        <section id={"buy"} aria-labelledby={"buy-title"}>
          <div className={"wrap"}>
            <div className={"sec-head center"}>
              <span className={"label"}>
                <span className={"fa"}>محل خرید</span>
                <span className={"en"}>Where to buy</span>
                <span className={"ps"}>د پېرود ځای</span>
              </span>
              <h2 id={"buy-title"} className={"h-display"}>
                <span className={"fa"}>فروشگاه کشور خود را انتخاب کنید</span>
                <span className={"en"}>Pick the store for your country</span>
                <span className={"ps"}>د خپل هېواد پلورنځی وټاکئ</span>
              </h2>
            </div>
            <div className={"regions"}>
              <div className={"region"}>
                <h3>
                  <span className={"fa"}>آمریکا، کانادا، استرالیا</span>
                  <span className={"en"}>USA, Canada, Australia</span>
                  <span className={"ps"}>امریکا، کاناډا، اسټرالیا</span>
                </h3>
                <p>
                  <span className={"fa"}>خرید و ارسال از طریق آمازون</span>
                  <span className={"en"}>Buy and ship through Amazon</span>
                  <span className={"ps"}>د امازون له لارې پېرود او لېږد</span>
                </p>
                <a
                  className={"store"}
                  data-ch={"amazon_us"}
                  href={"https://www.amazon.com/dp/B0GDWXN2ZK"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"amazon_us"}
                >
                  <span>
                    <b>Amazon US</b>
                    <small>amazon.com</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
                <a
                  className={"store"}
                  data-ch={"amazon_ca"}
                  href={"https://www.amazon.ca/dp/B0GDWM1PZV"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"amazon_ca"}
                >
                  <span>
                    <b>Amazon Canada</b>
                    <small>amazon.ca</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
                <a
                  className={"store"}
                  data-ch={"amazon_au"}
                  href={"https://www.amazon.com.au/dp/B0GDWR2TND"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"amazon_au"}
                >
                  <span>
                    <b>Amazon Australia</b>
                    <small>amazon.com.au</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
              </div>
              <div className={"region"}>
                <h3>
                  <span className={"fa"}>بریتانیا، اروپا، کشورهای عربی</span>
                  <span className={"en"}>UK, Europe, Arab countries</span>
                  <span className={"ps"}>بریتانیا، اروپا، عربي هېوادونه</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    سفارش مستقیم از ریحانه با پی‌پال؛ تحویل ۱۰ تا ۱۵ روز کاری
                  </span>
                  <span className={"en"}>
                    Order direct from Rayhana with PayPal · 10–15 business days
                  </span>
                  <span className={"ps"}>
                    له ریحانه مستقیم فرمایش د PayPal سره · ۱۰–۱۵ کاري ورځې
                  </span>
                </p>
                <a
                  className={"store"}
                  data-ch={"direct_uk"}
                  href={"https://www.paypal.com/ncp/payment/6YR8TPB4YFSPY"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"direct_uk"}
                >
                  <span>
                    <b>
                      <span className={"fa"}>بریتانیا</span>
                      <span className={"en"}>United Kingdom</span>
                      <span className={"ps"}>بریتانیا</span>
                    </b>
                    <small>GBP £ · PayPal</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
                <a
                  className={"store"}
                  data-ch={"direct_eu"}
                  href={"https://www.paypal.com/ncp/payment/A44VPB9VDT72J"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"direct_eu"}
                >
                  <span>
                    <b>
                      <span className={"fa"}>اروپا</span>
                      <span className={"en"}>Europe</span>
                      <span className={"ps"}>اروپا</span>
                    </b>
                    <small>EUR € · PayPal</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
                <a
                  className={"store"}
                  data-ch={"direct_arab"}
                  href={"https://www.paypal.com/ncp/payment/XLH22LR32VGKQ"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"direct_arab"}
                >
                  <span>
                    <b>
                      <span className={"fa"}>کشورهای عربی</span>
                      <span className={"en"}>Arab countries</span>
                      <span className={"ps"}>عربي هېوادونه</span>
                    </b>
                    <small>USD $ · PayPal</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
              </div>
              <div className={"region"}>
                <h3>
                  <span className={"fa"}>افغانستان</span>
                  <span className={"en"}>Afghanistan</span>
                  <span className={"ps"}>افغانستان</span>
                </h3>
                <p>
                  <span className={"fa"}>
                    از فروشگاه آنلاین شاپینو۲۴. مشتریان ترکیه نیز از همین‌جا
                    سفارش می‌دهند.
                  </span>
                  <span className={"en"}>
                    Through the Shopino24 online store. Customers in Turkey can
                    order here too.
                  </span>
                  <span className={"ps"}>
                    د شاپینو۲۴ آنلاین پلورنځي له لارې. په ترکیه کې پېرودونکي هم
                    له دې ځایه فرمایش ورکولی شي.
                  </span>
                </p>
                <a
                  className={"store"}
                  data-ch={"shopino24"}
                  href={"https://shopino24.com/products/dyg-kably-ryhanh"}
                  target={"_blank"}
                  rel={"noopener"}
                  data-track={"outbound_click"}
                  data-store={"shopino24"}
                >
                  <span>
                    <b>Shopino24</b>
                    <small>shopino24.com</small>
                  </span>
                  <span className={"arr"}>
                    <svg
                      className={"external-icon"}
                      viewBox={"0 0 24 24"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                    </svg>
                  </span>
                </a>
              </div>
            </div>
            <div className={"main-store"}>
              <div>
                <strong>
                  <span className={"fa"}>همه گزینه‌ها در rayhana.com</span>
                  <span className={"en"}>All options on rayhana.com</span>
                  <span className={"ps"}>ټولې لارې په rayhana.com کې</span>
                </strong>
                <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>
                  <span className={"fa"}>
                    پرداخت با PayPal، Apple Pay یا کارت. برای سفارش مستقیم بیش
                    از ۳ دیگ، ارسال رایگان است.
                  </span>
                  <span className={"en"}>
                    Pay with PayPal, Apple Pay or card. Direct orders of more
                    than 3 pots ship free.
                  </span>
                  <span className={"ps"}>
                    د PayPal، Apple Pay یا کارت تادیه. له ۳ ډېرو دېګونو مستقیم
                    فرمایش وړیا لېږل کېږي.
                  </span>
                </div>
              </div>
              <a
                className={"btn btn-red"}
                href={"https://rayhana.com/products"}
                target={"_blank"}
                rel={"noopener"}
                data-track={"outbound_click"}
                data-store={"rayhana_products"}
              >
                rayhana.com{" "}
                <svg
                  className={"external-icon"}
                  viewBox={"0 0 24 24"}
                  aria-hidden={"true"}
                >
                  <path d={"M5 12h14M12 5l7 7-7 7"}></path>
                </svg>
              </a>
            </div>
            <p className={"disclaimer"} id={"disclaimer"}>
              <span className={"fa"}>
                میزان و شرایط تخفیف جمعه سیاه ممکن است در هر فروشگاه متفاوت
                باشد. قیمت نهایی را پیش از پرداخت بررسی کنید.
              </span>
              <span className={"en"}>
                Black Friday availability and discounts may differ by store.
                Check the final price before you pay.
              </span>
              <span className={"ps"}>
                د تورې جمعې تخفیف او شرایط ښايي په هر پلورنځي کې توپیر ولري. له
                تادیې مخکې وروستۍ بیه وګورئ.
              </span>
            </p>
          </div>
        </section>
        <section
          id={"faq"}
          style={{
            background: "var(--ink2)",
            borderTop: "1px solid var(--line)",
          }}
          aria-labelledby={"faq-title"}
        >
          <div className={"wrap"}>
            <div className={"sec-head center"}>
              <span className={"label"}>
                <span className={"fa"}>پرسش‌های متداول</span>
                <span className={"en"}>FAQ</span>
                <span className={"ps"}>عامې پوښتنې</span>
              </span>
              <h2 id={"faq-title"} className={"h-display"}>
                <span className={"fa"}>پیش از خرید بدانید</span>
                <span className={"en"}>Good to know before you order</span>
                <span className={"ps"}>له پېرود مخکې پوه شئ</span>
              </h2>
            </div>
            <div className={"faq"} id={"faq-list"}>
              <h3>
                <button type={"button"} aria-expanded={false} data-q={"size"}>
                  <span className={"fa"}>
                    کدام اندازه را انتخاب کنم؟ تفاوت ۷، ۹ و ۱۲ چیست؟
                  </span>
                  <span className={"en"}>
                    Which size should I choose? How do 7, 9 and 12 differ?
                  </span>
                  <span className={"ps"}>
                    کومه اندازه وټاکم؟ د ۷، ۹ او ۱۲ توپیر څه دی؟
                  </span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>
                  اعداد نشان‌دهنده گنجایش به لیتر است: ۷ لیتر برای ۴ تا ۶ نفر، ۹
                  لیتر برای ۶ تا ۸ نفر و ۱۲ لیتر برای ۸ تا ۱۲ نفر.
                </span>
                <span className={"en"}>
                  The numbers are the capacity in litres: 7 L serves 4–6 people,
                  9 L serves 6–8 and 12 L serves 8–12.
                </span>
                <span className={"ps"}>
                  شمېرې په لیتر ظرفیت ښيي: ۷ لیتره د ۴–۶ کسانو، ۹ لیتره د ۶–۸
                  کسانو او ۱۲ لیتره د ۸–۱۲ کسانو لپاره.
                </span>
              </div>
              <h3>
                <button type={"button"} aria-expanded={false} data-q={"colors"}>
                  <span className={"fa"}>چه رنگ‌هایی موجود است؟</span>
                  <span className={"en"}>Which colours are available?</span>
                  <span className={"ps"}>کوم رنګونه شته؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>سرخ و خاکستری، در هر سه اندازه.</span>
                <span className={"en"}>Red and grey, in all three sizes.</span>
                <span className={"ps"}>سور او خړ، په درېیو اندازو کې.</span>
              </div>
              <h3>
                <button
                  type={"button"}
                  aria-expanded={false}
                  data-q={"induction"}
                >
                  <span className={"fa"}>آیا روی اجاق القایی کار می‌کند؟</span>
                  <span className={"en"}>
                    Does it work on induction cooktops?
                  </span>
                  <span className={"ps"}>ایا په انډکشن بخارۍ کار کوي؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>
                  بله. کف القایی دارد و روی اجاق‌های گازی، برقی، سرامیکی و
                  القایی کار می‌کند. داخل فر هم قابل استفاده است.
                </span>
                <span className={"en"}>
                  Yes. It has an induction base and works on gas, electric,
                  ceramic and induction cooktops. It is also oven-safe.
                </span>
                <span className={"ps"}>
                  هو. انډکشن تل لري او په ګاز، برقي، سیرامیک او انډکشن بخاریو
                  کار کوي. په تنور کې هم کارول کېږي.
                </span>
              </div>
              <h3>
                <button type={"button"} aria-expanded={false} data-q={"box"}>
                  <span className={"fa"}>چه چیزهایی داخل بسته است؟</span>
                  <span className={"en"}>What's included?</span>
                  <span className={"ps"}>په بسته کې څه دي؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <ul className={"fa"}>
                  <li>یک دیگ ریحانه</li>
                  <li>یک کفگیر سیلیکونی</li>
                  <li>دو گوش‌گیر سیلیکونی</li>
                  <li>یک مگنت یادبود از شهرهای باستانی</li>
                  <li>دفترچه راهنما</li>
                </ul>
                <ul className={"en"}>
                  <li>1 Rayhana pot</li>
                  <li>1 silicone spatula</li>
                  <li>2 silicone handle covers</li>
                  <li>1 souvenir magnet (ancient cities)</li>
                  <li>1 user manual</li>
                </ul>
                <ul className={"ps"}>
                  <li>یو دېګ</li>
                  <li>سیلیکوني کفګیر</li>
                  <li>دوه سیلیکوني لاس‌نیونکي</li>
                  <li>د تاریخي ښارونو مګنیټ</li>
                  <li>د کارولو لارښود</li>
                </ul>
              </div>
              <h3>
                <button type={"button"} aria-expanded={false} data-q={"clean"}>
                  <span className={"fa"}>آیا شستن آن آسان است؟</span>
                  <span className={"en"}>Is it easy to clean?</span>
                  <span className={"ps"}>ایا مینځل یې اسانه دي؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>
                  بله، قابل شستشو در ماشین ظرفشویی است؛ اما برای حفظ پوشش نچسب،
                  شستشو با دست و اسفنج نرم توصیه می‌شود.
                </span>
                <span className={"en"}>
                  Yes, it is dishwasher safe. To keep the non-stick coating at
                  its best, hand washing with a soft sponge is recommended.
                </span>
                <span className={"ps"}>
                  هو، په ماشین کې د مینځلو وړ دی؛ خو د نه نښلېدونکي پوښ د ساتنې
                  لپاره په نرم اسفنج او لاس مینځل سپارښتنه کېږي.
                </span>
              </div>
              <h3>
                <button
                  type={"button"}
                  aria-expanded={false}
                  data-q={"warranty"}
                >
                  <span className={"fa"}>آیا گارانتی دارد؟</span>
                  <span className={"en"}>Is there a warranty?</span>
                  <span className={"ps"}>ایا ضمانت لري؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>
                  بله، دیگ‌های ریحانه یک سال گارانتی دارند.
                </span>
                <span className={"en"}>
                  Yes, Rayhana pots come with a one-year warranty.
                </span>
                <span className={"ps"}>
                  هو، د ریحانه دېګونه یو کال ضمانت لري.
                </span>
              </div>
              <h3>
                <button
                  type={"button"}
                  aria-expanded={false}
                  data-q={"discount"}
                >
                  <span className={"fa"}>تخفیف جمعه سیاه چطور کار می‌کند؟</span>
                  <span className={"en"}>
                    How does the Black Friday discount work?
                  </span>
                  <span className={"ps"}>د تورې جمعې تخفیف څنګه کار کوي؟</span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <div data-rules-copy={""}>{renderRulesCopy()}</div>
              </div>
              <h3>
                <button type={"button"} aria-expanded={false} data-q={"mix"}>
                  <span className={"fa"}>
                    آیا می‌توانم اندازه‌ها و رنگ‌های مختلف را با هم بخرم؟
                  </span>
                  <span className={"en"}>
                    Can I combine different sizes and colours?
                  </span>
                  <span className={"ps"}>
                    ایا بېلابېلې اندازې او رنګونه یوځای اخیستلی شم؟
                  </span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <div data-mix-copy={""}>
                  <span className={"fa"}>
                    پیش از سفارش ترکیبی، با{" "}
                    <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a>{" "}
                    تماس بگیرید تا شرایط را تأیید کنیم.
                  </span>
                  <span className={"en"}>
                    Before ordering a mix, email{" "}
                    <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a> and
                    we will confirm how the discount applies.
                  </span>
                  <span className={"ps"}>
                    له ګډ فرمایش مخکې{" "}
                    <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a> ته
                    برېښنالیک ولېږئ چې شرایط درته تایید کړو.
                  </span>
                </div>
              </div>
              <h3>
                <button
                  type={"button"}
                  aria-expanded={false}
                  data-q={"countries"}
                >
                  <span className={"fa"}>
                    از کدام کشورها می‌توانم سفارش دهم؟
                  </span>
                  <span className={"en"}>
                    Which countries can I order from?
                  </span>
                  <span className={"ps"}>
                    له کومو هېوادونو فرمایش ورکولی شم؟
                  </span>
                </button>
              </h3>
              <div className={"ans"} hidden={true}>
                <span className={"fa"}>
                  از طریق آمازون: آمریکا، کانادا و استرالیا. ارسال مستقیم از
                  ریحانه با پی‌پال: بریتانیا، اروپا و کشورهای عربی. در افغانستان
                  و ترکیه از طریق شاپینو۲۴. برای سایر کشورها با{" "}
                  <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a> تماس
                  بگیرید.
                </span>
                <span className={"en"}>
                  Through Amazon: USA, Canada and Australia. Direct from Rayhana
                  with PayPal: UK, Europe and Arab countries. Afghanistan and
                  Turkey: through Shopino24. For anywhere else, email{" "}
                  <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a>.
                </span>
                <span className={"ps"}>
                  د امازون له لارې: امریکا، کاناډا او اسټرالیا. له ریحانه مستقیم
                  د PayPal سره: بریتانیا، اروپا او عربي هېوادونه. افغانستان او
                  ترکیه: د شاپینو۲۴ له لارې. د نورو هېوادونو لپاره{" "}
                  <a href={"mailto:info@rayhana.com"}>info@rayhana.com</a> ته
                  برېښنالیک ولېږئ.
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className={"final"} aria-labelledby={"final-title"}>
          <div className={"wrap"}>
            <div className={"s-active"}>
              <h2 id={"final-title"} className={"h-display"}>
                <span className={"fa"}>
                  تخفیف جمعه سیاه ریحانه را از دست ندهید
                </span>
                <span className={"en"}>
                  Don't miss the Rayhana Black Friday offer
                </span>
                <span className={"ps"}>
                  د ریحانه د تورې جمعې تخفیف له لاسه مه ورکوئ
                </span>
              </h2>
              <p>
                <span className={"fa"}>
                  دیگ ریحانه خود را انتخاب کنید، از تخفیف جمعه سیاه بهره ببرید و
                  طعم خانه را به آشپزخانه‌تان بیاورید.
                </span>
                <span className={"en"}>
                  Choose your Rayhana pot, enjoy Black Friday savings and bring
                  the taste of home to your kitchen.
                </span>
                <span className={"ps"}>
                  خپل د ریحانه دېګ وټاکئ، د تورې جمعې له تخفیف ګټه واخلئ او د
                  کور خوند خپل پخلنځي ته راوړئ.
                </span>
              </p>
              <div className={"sum"}>
                <span>
                  <span className={"fa"}>۱ دیگ: ۱۰٪</span>
                  <span className={"en"}>1 pot · 10% off</span>
                  <span className={"ps"}>۱ دېګ: ۱۰٪</span>
                </span>
                <span>
                  <span className={"fa"}>۲ دیگ: ۱۵٪</span>
                  <span className={"en"}>2 pots · 15% off</span>
                  <span className={"ps"}>۲ دېګه: ۱۵٪</span>
                </span>
                <span>
                  <span className={"fa"}>۳ دیگ: ۲۰٪</span>
                  <span className={"en"}>3 pots · 20% off</span>
                  <span className={"ps"}>۳ دېګه: ۲۰٪</span>
                </span>
              </div>
              <p style={{ marginTop: "10px" }}>
                <span className={"fa"}>۲۷ تا ۳۰ نوامبر ۲۰۲۶</span>
                <span className={"en"}>November 27–30, 2026</span>
                <span className={"ps"}>د نومبر ۲۷–۳۰، ۲۰۲۶</span>
              </p>
              <div className={"acts"}>
                <a
                  className={"btn btn-red s-live"}
                  href={"#buy"}
                  data-track={"cta_click"}
                  data-cta={"final_shop"}
                >
                  <span className={"fa"}>همین حالا خرید کنید</span>
                  <span className={"en"}>Shop now</span>
                  <span className={"ps"}>همدا اوس واخلئ</span>
                </a>
                <button
                  className={"btn btn-red s-pre"}
                  type={"button"}
                  data-ics={""}
                  data-track={"cta_click"}
                  data-cta={"final_calendar"}
                >
                  <span className={"fa"}>یادآوری در تقویم</span>
                  <span className={"en"}>Remind me — add to calendar</span>
                  <span className={"ps"}>په کلیز کې یادونه</span>
                </button>
                <a
                  className={"btn btn-ghost"}
                  href={"#pots"}
                  data-track={"cta_click"}
                  data-cta={"final_pots"}
                >
                  <span className={"fa"}>مقایسه اندازه‌ها</span>
                  <span className={"en"}>Compare sizes</span>
                  <span className={"ps"}>اندازې پرتله کړئ</span>
                </a>
              </div>
            </div>
            <div className={"s-ended"}>
              <h2 className={"h-display"}>
                <span className={"fa"}>
                  جمعه سیاه تمام شد، طعم خانه ادامه دارد
                </span>
                <span className={"en"}>
                  Black Friday is over. The taste of home isn't.
                </span>
                <span className={"ps"}>
                  تور جمعه پای ته ورسېده، د کور خوند دوام لري
                </span>
              </h2>
              <div className={"acts"}>
                <a
                  className={"btn btn-red"}
                  href={"https://rayhana.com/products"}
                  data-track={"outbound_click"}
                  data-store={"rayhana_products"}
                >
                  <span className={"fa"}>خرید از ریحانه</span>
                  <span className={"en"}>Shop Rayhana</span>
                  <span className={"ps"}>له ریحانه واخلئ</span>
                </a>
              </div>
            </div>
          </div>
        </section>{" "}
      </main>
      <div className="sticky s-active" id="sticky">
        <a className="btn btn-red s-live" href="#buy">
          <span className="fa">خرید با تا ۲۰٪ تخفیف</span>
          <span className="en">Shop · up to 20% off</span>
          <span className="ps">تر ۲۰٪ تخفیف سره واخلئ</span>
        </a>
        <button
          className="btn btn-red s-pre"
          type="button"
          data-ics
          style={{ width: "100%" }}
        >
          <span className="fa">یادآوری ۲۷ نوامبر</span>
          <span className="en">Remind me on Nov 27</span>
          <span className="ps">د نومبر ۲۷ یادونه</span>
        </button>
      </div>
    </div>
  );
}
