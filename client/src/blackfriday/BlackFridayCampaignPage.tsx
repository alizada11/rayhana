import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Globe2,
  Flame,
  Heart,
  Leaf,
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Soup,
  BookOpen,
  HandHeart,
  Package,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { useTranslation } from "react-i18next";
import BuyingDialog, { type Copy } from "@/blackfriday/components/rayhana/BuyingDialog";
import Community from "@/blackfriday/components/rayhana/Community";
import MarketRecommendation from "@/blackfriday/components/rayhana/MarketRecommendation";
import BlackFridayOffers from "@/blackfriday/components/rayhana/BlackFridayOffers";
import BrandStory from "@/blackfriday/components/rayhana/BrandStory";
import Testimonials from "@/blackfriday/components/rayhana/Testimonials";
import MarketFlag from "@/blackfriday/components/rayhana/MarketFlag";
import { blackFridayCopy, type OfferQuantity } from "@/blackfriday/data/blackFriday";
import useMarketPreference from "@/blackfriday/hooks/useMarketPreference";
import {
  formatLocationTemplate,
  locationCopy,
  potStoreLabel,
} from "@/blackfriday/data/locationCopy";
import {
  formatCapacity,
  getPurchaseUrl,
  Language,
  MarketId,
  markets,
  media,
  ProductId,
  translatedAlt,
} from "@/blackfriday/data/catalog";
import { campaignCopy } from "@/blackfriday/data/campaign";
import en from "@/blackfriday/data/en.json";
import fa from "@/blackfriday/data/fa.json";
import ps from "@/blackfriday/data/ps.json";
import "./styles/campaign.css";
import "./styles/black-friday.css";
import "./styles/story-testimonials.css";
import "./styles/community.css";
import "./styles/integration.css";

const dictionaries: Record<Language, Copy> = { en, fa, ps };
const videoControlLabels: Record<Language, {
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  volume: string;
  seek: string;
  speed: string;
  fullscreen: string;
  exitFullscreen: string;
}> = {
  en: {
    play: "Play video",
    pause: "Pause video",
    mute: "Mute video",
    unmute: "Unmute video",
    volume: "Volume",
    seek: "Seek video",
    speed: "Playback speed",
    fullscreen: "Enter fullscreen",
    exitFullscreen: "Exit fullscreen",
  },
  fa: {
    play: "پخش ویدیو",
    pause: "توقف ویدیو",
    mute: "بی‌صدا کردن ویدیو",
    unmute: "با صدا کردن ویدیو",
    volume: "بلندی صدا",
    seek: "جایگاه پخش ویدیو",
    speed: "سرعت پخش",
    fullscreen: "نمایش تمام‌صفحه",
    exitFullscreen: "خروج از تمام‌صفحه",
  },
  ps: {
    play: "ویډیو غږول",
    pause: "ویډیو درول",
    mute: "ویډیو بې‌غږه کول",
    unmute: "د ویډیو غږ چالانول",
    volume: "د غږ کچه",
    seek: "د ویډیو د غږولو ځای",
    speed: "د غږولو چټکتیا",
    fullscreen: "بشپړه پرده",
    exitFullscreen: "له بشپړې پردې وتل",
  },
};

export default function BlackFridayCampaignPage() {
  const { i18n } = useTranslation();
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const language: Language = activeLanguage === "ps" || activeLanguage === "fa" ? activeLanguage : "en";
  const preference = useMarketPreference();
  const market = preference.market;
  const [capacity, setCapacity] = useState(9);
  const [quantity, setQuantity] = useState<OfferQuantity>(1);
  const [product, setProduct] = useState<ProductId>("pot");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [gallery, setGallery] = useState(0);
  const mandolineVideoRef = useRef<HTMLVideoElement>(null);
  const mandolinePlayerRef = useRef<HTMLDivElement>(null);
  const [mandolineVideoActive, setMandolineVideoActive] = useState(false);
  const [mandolineVideoPinned, setMandolineVideoPinned] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [status, setStatus] = useState("");
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroPlayerRef = useRef<HTMLDivElement>(null);
  const [heroVideoActive, setHeroVideoActive] = useState(false);
  const [heroVideoPinned, setHeroVideoPinned] = useState(false);
  const campaignRoot = useRef<HTMLDivElement>(null);
  const copy = dictionaries[language];
  const c = campaignCopy[language];
  const offer = blackFridayCopy[language];
  const rtl = language !== "en";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const country = markets.find(m => m.id === market);
  const alt = translatedAlt[language];
  const location = locationCopy[language];
  const canPreviewMandoline = gallery === 0 && Boolean(media.demo);
  const potLink = getPurchaseUrl("pot", market, capacity);
  const buyPotLabel = potStoreLabel(
    language,
    market,
    country?.country[language],
    !!potLink
  );
  const stickyBuyLabel =
    country && getPurchaseUrl(product, market, capacity)
      ? formatLocationTemplate(
          country.retailer === "amazon" ? location.amazon : location.shopino24,
          country.country[language]
        )
      : location.generalBuy;

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 650);
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setProduct(entry.target.id === "mandoline" ? "mandoline" : "pot");
        }
      },
      { rootMargin: "-10% 0px -35% 0px", threshold: 0.08 }
    );
    for (const id of ["pot", "quality", "markets", "mandoline", "community"]) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.title = c.title;
    for (const [selector, content] of [
      ['meta[name="description"]', c.description],
      ['meta[property="og:title"]', c.title],
      ['meta[property="og:description"]', c.description],
      ['meta[name="twitter:title"]', c.title],
      ['meta[name="twitter:description"]', c.description],
    ])
      document.querySelector(selector)?.setAttribute("content", content);
  }, [language, rtl, c.title, c.description]);

  function changeMarket(next: MarketId) {
    preference.chooseMarket(next);
    setStatus(copy.selectionUpdated);
  }
  function openBuying(next: ProductId = product) {
    setProduct(next);
    setPurchaseOpen(true);
  }
  function previewHeroVideo() {
    const video = heroVideoRef.current;
    if (!video) return;
    setHeroVideoActive(true);
    video.muted = true;
    void video.play().catch(() => setHeroVideoActive(false));
  }

  function pinHeroVideo() {
    const video = heroVideoRef.current;
    if (!video) return;
    setHeroVideoPinned(true);
    setHeroVideoActive(true);
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => setHeroVideoActive(false));
    });
  }

  function stopHeroPreview() {
    if (heroVideoPinned) return;
    const video = heroVideoRef.current;
    video?.pause();
    if (video) video.currentTime = 0;
    setHeroVideoActive(false);
  }

  function previewMandolineVideo() {
    if (gallery !== 0) return;
    const video = mandolineVideoRef.current;
    if (!video) return;
    setMandolineVideoActive(true);
    video.muted = true;
    void video.play().catch(() => setMandolineVideoActive(false));
  }

  function pinMandolineVideo() {
    if (gallery !== 0) return;
    const video = mandolineVideoRef.current;
    if (!video) return;
    setMandolineVideoPinned(true);
    setMandolineVideoActive(true);
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => setMandolineVideoActive(false));
    });
  }

  function stopMandolinePreview(force = false) {
    if (mandolineVideoPinned && !force) return;
    const video = mandolineVideoRef.current;
    video?.pause();
    if (video) video.currentTime = 0;
    if (force) setMandolineVideoPinned(false);
    setMandolineVideoActive(false);
  }

  return (
    <div
      ref={campaignRoot}
      className={`rayhana-site campaign-site ${rtl ? "is-rtl" : "is-ltr"}`}
      dir={rtl ? "rtl" : "ltr"}
      lang={language}
    >
      <a className="skip-link" href="#main">
        {copy.skip}
      </a>
      <div id="main" className="campaign-main">
        <section className="hero section-shell campaign-hero">
          <div className="hero-copy">
            <div className="campaign-label">
              <span className="red-dot" />
              {copy.campaign}
              <span className="campaign-year" dir="ltr">
                2026
              </span>
            </div>
            <p className="hero-eyebrow">{copy.heroEyebrow}</p>
            <h1>
              <span>{copy.heroLine1}</span>
              {copy.heroLine2 && (
                <span className="red-line">{copy.heroLine2}</span>
              )}
            </h1>
            <p className="hero-body">{copy.heroBody}</p>
            <div className="hero-actions">
              <a className="button primary hero-button" href="#pot">
                {copy.heroAction}
                <Arrow size={20} />
              </a>
              <a className="button secondary hero-offer-button" href="#black-friday">
                {offer.teaser}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="tiny-line" />
              <span>{copy.heroFootnote}</span>
            </div>
            <MarketRecommendation
              language={language}
              preference={preference}
              onChange={() => openBuying("pot")}
              compact
            />
          </div>
          <div className="hero-visual">
            <div
              ref={heroPlayerRef}
              className={`hero-arch ${heroVideoActive ? "is-video-active" : ""}`}
              onMouseEnter={previewHeroVideo}
              onMouseLeave={stopHeroPreview}
            >
              <img
                className="hero-product-image"
                src={media.potHero}
                alt={alt.pot}
              />
              <video
                ref={heroVideoRef}
                className="hero-product-video"
                poster={media.potHero}
                muted
                playsInline
                preload="none"
                aria-label={c.potVideoAction}
                onPause={() => {
                  if (heroVideoRef.current?.ended) return;
                  setHeroVideoPinned(false);
                  setHeroVideoActive(false);
                }}
                onEnded={() => {
                  if (heroVideoRef.current) heroVideoRef.current.currentTime = 0;
                  setHeroVideoPinned(false);
                  setHeroVideoActive(false);
                }}
              >
                <source src={media.potDemo} type="video/mp4" />
              </video>
              <BrandedVideoControls
                videoRef={heroVideoRef}
                fullscreenTargetRef={heroPlayerRef}
                label={c.potVideoAction}
                controlLabels={videoControlLabels[language]}
                className="hero-video-controls"
                active={heroVideoActive}
              />
              {!heroVideoPinned && (
                <button
                  type="button"
                  className="hero-video-trigger"
                  aria-label={c.potVideoAction}
                  onClick={pinHeroVideo}
                >
                  <span className="hero-video-play" aria-hidden="true">
                    <Play size={21} fill="currentColor" />
                  </span>
                  <span className="sr-only">{c.potVideoAction}</span>
                </button>
              )}
                <div className="hero-photo-caption">
                  <span>{copy.heroImageCaption}</span>
                  <ArrowUpRight size={19} />
                </div>
            </div>
            <div className="hero-seal" aria-hidden="true">
              <Heart size={20} />
              <span>RAYHANA</span>
              <small>ROOTS IN MODERN LIFE</small>
            </div>
          </div>
        </section>

        <BlackFridayOffers
          language={language}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onContinue={() => openBuying("pot")}
          market={market}
        />

        <BrandStory language={language} imageAlt={alt.story} />
        <div className="values-ribbon">
          {c.values.map((value, index) => (
            <React.Fragment key={value}>
              <span>{value}</span>
              {index < c.values.length - 1 && (
                <span className="value-divider" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>

        <span id="collection" className="section-anchor" />
        <section
          className="product-section section-shell campaign-pot"
          id="pot"
        >
          <div className="product-media pot-product-media">
            <div className="product-photo" data-capacity={capacity}>
              <img
                src={media.potDetail}
                alt={alt.pot}
                loading="lazy"
                width="850"
                height="900"
              />
            </div>
            <div className="capacity-picker">
              <span className="field-heading">{copy.capacity}</span>
              <div
                className="size-buttons"
                role="group"
                aria-label={copy.capacity}
              >
                {[7, 9, 12].map(size => (
                  <button
                    key={size}
                    aria-pressed={capacity === size}
                    className={capacity === size ? "active" : ""}
                    onClick={() => setCapacity(size)}
                  >
                    {formatCapacity(size, language)} <span>{copy.litres}</span>
                  </button>
                ))}
              </div>
              <p className="microcopy">{copy.capacityHint}</p>
            </div>
            <p className="pot-image-wordmark" aria-hidden="true">
              RAYHANA<span>THE HEART OF THE TABLE</span>
            </p>
          </div>
          <div className="product-copy">
            <p className="eyebrow">{copy.potEyebrow}</p>
            <h2 className="line-heading">{c.potIntro}</h2>
            <p className="product-intro">{copy.potBody}</p>
            <div className="feature-list pot-features">
              <Feature
                icon={<Leaf />}
                title={copy.potMaterialTitle}
                text={copy.potMaterialBody}
              />
              <Feature
                icon={<ShieldCheck />}
                title={c.coatingTitle}
                text={c.coatingBody}
              />
              <Feature
                icon={<Flame />}
                title={copy.potHobTitle}
                text={copy.potHobBody}
              />
              <Feature
                icon={<Soup />}
                title={copy.potOvenTitle}
                text={copy.potOvenBody}
              />
              <Feature
                icon={<HandHeart />}
                title={c.careTitle}
                text={c.careBody}
              />
              <Feature
                icon={<Package />}
                title={c.accessoriesTitle}
                text={c.accessoriesBody}
              />
            </div>
          </div>
        </section>

        <section className="quality-section" id="quality">
          <div className="section-shell quality-inner">
            <div className="quality-copy">
              <p className="eyebrow">{c.qualityEyebrow}</p>
              <h2 className="line-heading campaign-heading">
                {c.qualityTitle}
              </h2>
              <p className="quality-intro">{c.qualityBody}</p>
            </div>
            <QualityVideo
              src={media.potDemo}
              poster={media.potDemoPoster}
              label={c.potVideoLabel}
              language={language}
            />
            <div className="quality-guide-row">
              <a
                className="button outline quality-guide-download"
                href="/files/rayhana-qabili-pot-user-guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Rayhana-Qabili-Pot-User-Guide.pdf"
              >
                <BookOpen size={16} />
                {copy.downloadPotGuide}
                <ArrowDownToLine size={15} />
              </a>
            </div>
          </div>
        </section>

        <Testimonials language={language} />

        <section className="markets-section campaign-buy" id="markets">
          <div className="section-shell markets-inner">
            <div className="markets-heading">
              <p className="eyebrow">{copy.offerEyebrow}</p>
              <h2>{c.offersTitle}</h2>
              <p>{c.offersBody}</p>
            </div>
            <MarketRecommendation
              language={language}
              preference={preference}
              onChange={() => openBuying("pot")}
            />
            <div
              className="market-options"
              role="group"
              aria-label={copy.destination}
            >
              {markets.map(item => (
                <button
                  key={item.id}
                  onClick={() => changeMarket(item.id)}
                  className={`market-card ${market === item.id ? "selected" : ""}`}
                  aria-pressed={market === item.id}
                >
                  <MarketFlag market={item.id} className="market-card-flag" />
                  <span className="market-name">
                    {item.retailer === "amazon"
                      ? copy.marketAmazon
                      : copy.marketShopino24} {item.country[language]}
                  </span>
                  <span className="amazon-label" dir="ltr">
                    {item.domain}
                  </span>
                  {market === item.id ? (
                    <Check className="market-check" size={17} />
                  ) : (
                    <Plus className="market-check" size={17} />
                  )}
                </button>
              ))}
            </div>
            <p className="market-helper">
              <Globe2 size={15} />
              {copy.marketNote}
            </p>
            <div className="market-buy-footer">
              <p>
                <span className="red-dot" />
                {offer.knownOffers}
              </p>
              <button
                className="button primary"
                onClick={() => openBuying("pot")}
              >
                {buyPotLabel}
                <Arrow size={19} />
              </button>
              <small>{copy.listingScopeNote}</small>
            </div>
          </div>
        </section>

        <section className="mandoline-section" id="mandoline">
          <div className="product-section section-shell mandoline-layout">
            <div className="product-copy">
              <p className="eyebrow">{copy.mandolineEyebrow}</p>
              <h2 className="line-heading">{copy.mandolineTitle}</h2>
              <p className="product-intro">{copy.mandolineBody}</p>
              <div className="feature-list">
                <Feature
                  icon={<SlidersHorizontal />}
                  title={copy.slicingTitle}
                  text={copy.slicingBody}
                />
                <Feature
                  icon={<Leaf />}
                  title={copy.julienneTitle}
                  text={copy.julienneBody}
                />
                <Feature
                  icon={<ShieldCheck />}
                  title={copy.holderTitle}
                  text={copy.holderBody}
                />
              </div>
              <div className="product-actions">
                <button
                  className="button primary"
                  onClick={() => openBuying("mandoline")}
                >
                  {copy.buyOptions}
                  <Arrow size={18} />
                </button>
              </div>
              <p className="safety-note">
                <ShieldCheck size={16} />
                <span>{copy.mandolineSafety}</span>
              </p>
              <a
                className="guide-link"
                href={`/${language}/help`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.readGuide}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="mandoline-gallery">
              <div
                ref={mandolinePlayerRef}
                className={`gallery-main${canPreviewMandoline ? " is-video-trigger" : ""}${mandolineVideoActive ? " is-video-active" : ""}`}
                role={canPreviewMandoline ? "group" : undefined}
                tabIndex={canPreviewMandoline ? 0 : undefined}
                aria-label={canPreviewMandoline ? copy.watchDemo : undefined}
                onMouseEnter={previewMandolineVideo}
                onMouseLeave={() => stopMandolinePreview()}
                onFocus={event => {
                  if (event.target === event.currentTarget) previewMandolineVideo();
                }}
                onBlur={event => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    stopMandolinePreview();
                  }
                }}
                onClick={canPreviewMandoline ? pinMandolineVideo : undefined}
                onKeyDown={event => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    pinMandolineVideo();
                  }
                  if (event.key === "Escape") stopMandolinePreview(true);
                }}
              >
                <img
                  className="gallery-main-image"
                  src={media.mandolineGallery[gallery]}
                  alt={alt.mandoline[gallery]}
                  width="900"
                  height="700"
                  loading="lazy"
                />
                {gallery === 0 && media.demo && (
                  <>
                    <video
                      ref={mandolineVideoRef}
                      className="gallery-main-video"
                      poster={media.mandolineGallery[0]}
                      playsInline
                      preload="none"
                      aria-label={copy.watchDemo}
                      onPause={() => {
                        if (mandolineVideoRef.current?.ended) return;
                        if (mandolineVideoRef.current?.paused) {
                          setMandolineVideoPinned(false);
                          setMandolineVideoActive(false);
                        }
                      }}
                      onEnded={() => {
                        setMandolineVideoPinned(false);
                        setMandolineVideoActive(false);
                      }}
                    >
                      <source src={media.demo} type="video/mp4" />
                    </video>
                    <BrandedVideoControls
                      videoRef={mandolineVideoRef}
                      fullscreenTargetRef={mandolinePlayerRef}
                      label={copy.watchDemo}
                      controlLabels={videoControlLabels[language]}
                      className="gallery-video-controls"
                      active={mandolineVideoActive}
                    />
                  </>
                )}
              </div>
              <div
                className="gallery-thumbs"
                role="group"
                aria-label={copy.galleryLabel}
              >
                {media.mandolineGallery.map((image, index) => (
                  <button
                    key={image}
                    className={gallery === index ? "active" : ""}
                    onClick={() => {
                      setMandolineVideoPinned(false);
                      stopMandolinePreview(true);
                      setGallery(index);
                    }}
                    aria-pressed={gallery === index}
                    aria-label={`${copy.galleryLabel} ${formatCapacity(index + 1, language)}: ${alt.mandoline[index]}`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      width="170"
                      height="113"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Community language={language} portalContainer={campaignRoot.current} />

        <section
          className="next-product-section section-shell"
          id="next-product"
        >
          <div className="concept-visual" aria-hidden="true">
            <div className="concept-pattern">
              <span className="concept-diamond" />
              <span className="concept-diamond small" />
            </div>
            <span className="concept-name">RAYHANA</span>
            <span className="concept-label">{c.nextLabel}</span>
          </div>
          <div className="next-copy">
            <p className="eyebrow">{c.nextEyebrow}</p>
            <h2 className="line-heading campaign-heading">{c.nextTitle}</h2>
            <p>{c.nextBody}</p>
            <ul>
              {c.nextPoints.map(text => (
                <li key={text}>
                  <Check size={16} />
                  {text}
                </li>
              ))}
            </ul>
            <p className="concept-note">{c.nextNote}</p>
            <a className="text-link" href="#community">
              {c.nextAction}
              <Arrow size={18} />
            </a>
          </div>
        </section>

        <section className="faq-section section-shell" id="faq">
          <div className="faq-heading">
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2>{copy.faqTitle}</h2>
            <a href="mailto:info@rayhana.com" className="contact-link">
              <Mail size={17} />
              <span dir="ltr">info@rayhana.com</span>
            </a>
          </div>
          <Accordion.Root className="faq-list" type="single" collapsible>
            {copy.faqItems.map((item, index) => (
              <Accordion.Item
                className="faq-item"
                key={index}
                value={`faq-${index}`}
              >
                <Accordion.Header>
                  <Accordion.Trigger>
                    {item.q}
                    <Plus size={19} />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <p>{item.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
        <section className="closing-section">
          <div className="closing-pattern" aria-hidden="true" />
          <p className="eyebrow">RAYHANA KITCHEN APPLIANCE</p>
          <h2 className="line-heading">{copy.closingTitle}</h2>
          <p>{copy.closingBody}</p>
          <button className="button light" onClick={() => openBuying("pot")}>
            {copy.closingAction}
            <Arrow size={19} />
          </button>
        </section>
      </div>
      <div
        className={`mobile-sticky ${sticky ? "visible" : ""}`}
        aria-hidden={!sticky}
      >
        <a
          href={product === "mandoline" ? "#mandoline" : "#pot"}
          tabIndex={sticky ? 0 : -1}
        >
          {product === "mandoline" ? copy.exploreMandoline : copy.explorePot}
        </a>
        <button
          className="button primary"
          tabIndex={sticky ? 0 : -1}
          onClick={() => openBuying()}
        >
          {stickyBuyLabel}
          <Arrow size={16} />
        </button>
      </div>
      <span role="status" className="sr-only" aria-live="polite">
        {status}
      </span>
      <BuyingDialog
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        language={language}
        copy={copy}
        market={market}
        onMarketChange={changeMarket}
        preference={preference}
        product={product}
        onProductChange={setProduct}
        capacity={capacity}
        onCapacityChange={setCapacity}
        quantity={quantity}
        onQuantityChange={setQuantity}
        portalContainer={campaignRoot.current}
      />
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="feature">
      <span className="feature-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function QualityVideo({
  src,
  poster,
  label,
  language,
}: {
  src: string;
  poster: string;
  label: string;
  language: Language;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const autoplayAttempted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (
          visible &&
          !autoplayAttempted.current &&
          timer === undefined
        ) {
          timer = window.setTimeout(() => {
            timer = undefined;
            if (autoplayAttempted.current) return;
            autoplayAttempted.current = true;
            video.muted = true;
            void video.play().catch(() => {});
          }, 2000);
        } else if (!visible) {
          if (timer !== undefined) {
            window.clearTimeout(timer);
            timer = undefined;
          }
          video.pause();
        }
      },
      { threshold: [0, 0.35] },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={playerRef} className="quality-video-frame">
      <video
        ref={videoRef}
        className="quality-video"
        poster={poster}
        playsInline
        preload="metadata"
        muted
        aria-label={label}
        onPlay={() => {
          autoplayAttempted.current = true;
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <BrandedVideoControls
        videoRef={videoRef}
        fullscreenTargetRef={playerRef}
        label={label}
        controlLabels={videoControlLabels[language]}
        className="quality-video-controls"
        active
      />
    </div>
  );
}

type VideoControlLabels = (typeof videoControlLabels)[Language];

function BrandedVideoControls({
  videoRef,
  fullscreenTargetRef,
  label,
  controlLabels,
  className,
  active,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fullscreenTargetRef: React.RefObject<HTMLElement | null>;
  label: string;
  controlLabels: VideoControlLabels;
  className: string;
  active: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      setPlaying(!video.paused && !video.ended);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setCurrentTime(video.currentTime || 0);
      setVolume(video.volume);
      setMuted(video.muted || video.volume === 0);
      setPlaybackRate(video.playbackRate);
    };
    const events = [
      "loadedmetadata",
      "durationchange",
      "timeupdate",
      "play",
      "pause",
      "ended",
      "volumechange",
      "ratechange",
    ];
    events.forEach(name => video.addEventListener(name, sync));
    sync();
    return () => events.forEach(name => video.removeEventListener(name, sync));
  }, [videoRef]);

  useEffect(() => {
    const syncFullscreen = () =>
      setFullscreen(document.fullscreenElement === fullscreenTargetRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, [fullscreenTargetRef]);

  if (!active) return null;
  const video = videoRef.current;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const rates = [1, 1.25, 1.5, 2];
  const timeLabel = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  const togglePlay = () => {
    const current = videoRef.current;
    if (!current) return;
    if (current.paused || current.ended) {
      if (current.ended) current.currentTime = 0;
      void current.play().catch(() => {});
    } else {
      current.pause();
    }
  };
  const toggleMute = () => {
    const current = videoRef.current;
    if (!current) return;
    if (current.muted || current.volume === 0) {
      current.muted = false;
      if (current.volume === 0) current.volume = 0.65;
    } else {
      current.muted = true;
    }
  };
  const setRate = () => {
    const current = videoRef.current;
    if (!current) return;
    const nextIndex = (rates.indexOf(current.playbackRate) + 1) % rates.length;
    current.playbackRate = rates[nextIndex];
  };
  const toggleFullscreen = () => {
    const container = fullscreenTargetRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void container.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className={`campaign-video-player ${className}`}
      role="group"
      aria-label={label}
      dir="ltr"
      onClick={event => event.stopPropagation()}
    >
      {!playing && (
        <button
          type="button"
          className="campaign-video-center-play"
          aria-label={controlLabels.play}
          onClick={togglePlay}
        >
          <Play size={26} fill="currentColor" aria-hidden="true" />
        </button>
      )}
      <div className="campaign-video-controlbar">
        <button
          type="button"
          className="campaign-video-icon-button"
          aria-label={playing ? controlLabels.pause : controlLabels.play}
          title={playing ? controlLabels.pause : controlLabels.play}
          onClick={togglePlay}
        >
          {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>
        <span className="campaign-video-time" aria-live="off">
          {timeLabel(currentTime)} <span>/</span> {timeLabel(duration)}
        </span>
        <input
          className="campaign-video-seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          style={{ "--video-progress": `${progress}%` } as React.CSSProperties}
          aria-label={controlLabels.seek}
          onChange={event => {
            if (video) video.currentTime = Number(event.currentTarget.value);
          }}
        />
        <button
          type="button"
          className="campaign-video-speed"
          aria-label={`${controlLabels.speed}: ${playbackRate}×`}
          title={controlLabels.speed}
          onClick={setRate}
        >
          {playbackRate}×
        </button>
        <div className="campaign-video-volume">
          <button
            type="button"
            className="campaign-video-icon-button"
            aria-label={muted ? controlLabels.unmute : controlLabels.mute}
            title={muted ? controlLabels.unmute : controlLabels.mute}
            onClick={toggleMute}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            className="campaign-video-volume-range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            style={{ "--video-volume": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
            aria-label={controlLabels.volume}
            onChange={event => {
              if (!video) return;
              const nextVolume = Number(event.currentTarget.value);
              video.volume = nextVolume;
              video.muted = nextVolume === 0;
            }}
          />
        </div>
        <button
          type="button"
          className="campaign-video-icon-button"
          aria-label={fullscreen ? controlLabels.exitFullscreen : controlLabels.fullscreen}
          title={fullscreen ? controlLabels.exitFullscreen : controlLabels.fullscreen}
          onClick={toggleFullscreen}
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  );
}
