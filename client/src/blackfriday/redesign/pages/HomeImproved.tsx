import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Flame,
  Globe2,
  Heart,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Play,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Soup,
  X,
  BookOpen,
  HandHeart,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Copy } from "@/blackfriday/redesign/components/rayhana/BuyingDialog";
import VideoDialog from "@/blackfriday/redesign/components/rayhana/VideoDialog";
import ViewportVideo from "@/blackfriday/redesign/components/rayhana/ViewportVideo";
import Community from "@/blackfriday/redesign/components/rayhana/Community";
import DirectStoreLinks from "@/blackfriday/redesign/components/rayhana/DirectStoreLinks";
import {
  getDirectMarket,
  getDirectMarketLabel,
  resolveDirectStoreMarket,
  type DirectMarketId,
  directStoreCopy,
  getDirectActionLabel,
  getDirectStoreUrl,
} from "@/blackfriday/redesign/data/directStores";
import {
  refinedCampaignCopy,
  refinedDictionary,
  rayhanaSupportWhatsAppUrl,
} from "@/blackfriday/redesign/data/refinedCampaign";
import {
  mandolineProductFacts,
  mandolineSpecCopy,
} from "@/blackfriday/redesign/data/mandolineSpecs";
import ImprovedHeroOffers from "@/blackfriday/redesign/components/rayhana/ImprovedHeroOffers";
import CookingVideoSlider from "@/blackfriday/redesign/components/rayhana/CookingVideoSlider";
import BrandStory from "@/blackfriday/redesign/components/rayhana/BrandStory";
import Testimonials from "@/blackfriday/redesign/components/rayhana/Testimonials";
import DirectMarketFlag from "@/blackfriday/redesign/components/rayhana/DirectMarketFlag";
import { blackFridayCopy, type OfferQuantity } from "@/blackfriday/redesign/data/blackFriday";
import { isProductUnavailable, regionalOfferCopy } from "@/blackfriday/redesign/data/regionalOffers";
import useDirectMarketPreference from "@/blackfriday/redesign/hooks/useDirectMarketPreference";
import { locationCopy } from "@/blackfriday/redesign/data/locationCopy";
import {
  formatCapacity,
  getMarketLabel,
  Language,
  languages,
  media,
  ProductId,
  translatedAlt,
} from "@/blackfriday/redesign/data/catalog";
import { campaignCopy } from "@/blackfriday/redesign/data/campaign";
import en from "@/blackfriday/redesign/data/en.json";
import fa from "@/blackfriday/redesign/data/fa.json";
import ps from "@/blackfriday/redesign/data/ps.json";
import "../components/rayhana/campaign.css";
import "../components/rayhana/community.css";
import "../design-base.css";
import "../components/rayhana/black-friday.css";
import "../components/rayhana/story-testimonials.css";
import "../components/rayhana/black-friday-hero.css";
import "../components/rayhana/campaign-continuity.css";
import "../components/rayhana/regional-campaign.css";
import "../components/rayhana/refined-campaign.css";
import "../components/rayhana/viewport-video.css";
import "../components/rayhana/black-friday-hero.css";
import "../components/rayhana/video-dialog.css";
import "../components/rayhana/heading-fonts.css";
import "../components/rayhana/dark-mode.css";

const dictionaries: Record<Language, Copy> = { en, fa, ps };
export function improvedLanguageFromPath(path: string): Language {
  const language = path.split("/").filter(Boolean).at(-1);
  return language === "en" || language === "ps" ? language : "fa";
}

export default function HomeImproved({
  initialLanguage,
  campaignRoute = false,
  onLanguageChange,
}: {
  initialLanguage?: Language;
  campaignRoute?: boolean;
  onLanguageChange?: (language: Language) => void;
}) {
  const [language, setLanguage] = useState<Language>(
    initialLanguage ||
      (typeof window === "undefined"
        ? "fa"
        : improvedLanguageFromPath(window.location.pathname))
  );
  useEffect(() => {
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialLanguage]);
  const preference = useDirectMarketPreference();
  const market = preference.market;
  const directMarket = preference.directMarket;
  const [quantity, setQuantity] = useState<OfferQuantity>(1);
  const [product, setProduct] = useState<ProductId>("pot");
  const [videoProduct, setVideoProduct] = useState<ProductId>("pot");
  const [videoOpen, setVideoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gallery, setGallery] = useState(0);
  const [demoEnabled, setDemoEnabled] = useState(true);
  const [sticky, setSticky] = useState(false);
  const [status, setStatus] = useState("");
  const copy = refinedDictionary(dictionaries[language], language);
  const r = refinedCampaignCopy[language];
  const m = mandolineSpecCopy[language];
  const direct = directStoreCopy[language];
  const c = campaignCopy[language];
  const offer = blackFridayCopy[language];
  const regional = regionalOfferCopy[language];
  const isAf = market === "AF";
  const mandolineUnavailable = isProductUnavailable("mandoline", market);
  const rtl = language !== "en";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const country = getDirectMarket(directMarket);
  const alt = translatedAlt[language];
  const location = locationCopy[language];

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 650);
    const onPop = () =>
      setLanguage(improvedLanguageFromPath(window.location.pathname));
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!campaignRoute) window.addEventListener("popstate", onPop);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (!campaignRoute) window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en";
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.title = c.title;
    const metaTags = [
      ["name", "description", c.description],
      ["property", "og:title", c.title],
      ["property", "og:description", c.description],
      ["name", "twitter:title", c.title],
      ["name", "twitter:description", c.description],
    ] as const;
    for (const [attribute, name, content] of metaTags) {
      let meta = document.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    }
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [language, rtl, c.title, c.description]);

  function changeLanguage(next: Language) {
    setLanguage(next);
    if (onLanguageChange) onLanguageChange(next);
    else
      window.history.pushState(
        {},
        "",
        `/improved/${next}${window.location.hash}`
      );
  }
  function changeMarket(next: DirectMarketId) {
    preference.chooseMarket(next);
    setStatus(copy.selectionUpdated);
  }
  function chooseStores(next: ProductId = product) {
    setProduct(next);
    setMobileOpen(false);
    requestAnimationFrame(() =>
      document
        .getElementById("direct-store-heading")
        ?.focus({ preventScroll: true })
    );
  }
  const potPurchaseUrl = getDirectStoreUrl("pot", directMarket);
  const mandolinePurchaseUrl = getDirectStoreUrl("mandoline", directMarket);
  const currentPurchaseUrl = getDirectStoreUrl(product, directMarket);
  const currentStore = getDirectMarket(
    resolveDirectStoreMarket(product, directMarket)
  );
  const currentProductName =
    product === "pot" ? copy.potName : copy.mandolineName;
  function openVideo(next: ProductId) {
    setVideoProduct(next);
    setVideoOpen(true);
  }

  const navigation = [
    { href: "#black-friday", label: r.navChoose },
    { href: "#pot", label: copy.explorePot },
    { href: "#reviews", label: c.reviewsAction },
    { href: "#faq", label: copy.navFaq },
    { href: "#story", label: copy.navStory },
  ];
  const languageControl = (
    <div className="language-control" role="group" aria-label={copy.language}>
      {languages.map(item => (
        <a
          href={campaignRoute ? "/black-friday" : `/improved/${item.id}`}
          key={item.id}
          lang={item.id}
          aria-current={language === item.id ? "page" : undefined}
          className={language === item.id ? "active" : ""}
          onClick={e => {
            e.preventDefault();
            changeLanguage(item.id);
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  return (
    <div
      className={`rayhana-site campaign-site black-friday-campaign refined-campaign ${sticky ? "has-sticky-store " : ""}${rtl ? "is-rtl" : "is-ltr"}`}
      dir={rtl ? "rtl" : "ltr"}
      lang={language}
    >
      <a className="skip-link" href="#main">
        {copy.skip}
      </a>
      <div className={`announcement${campaignRoute ? " redesign-chrome-hidden" : ""}`}>
        <a href="#black-friday">
          <span>{isAf ? regional.afTitle : copy.announcement}</span>
          <span className="announcement-action">
            {copy.seeOffers}
            <ArrowUpRight size={13} aria-hidden="true" />
          </span>
        </a>
      </div>
      <header className={`site-header${campaignRoute ? " redesign-chrome-hidden" : ""}`}>
        <div className="header-inner">
          <a
            href={campaignRoute ? "/" : `/improved/${language}`}
            className="brand"
            aria-label="Rayhana"
          >
            <img
              src={media.logo}
              width="180"
              height="49"
              alt="RAYHANA — Roots in Modern Life"
            />
          </a>
          <nav className="desktop-nav" aria-label={copy.menu}>
            {navigation.map(item => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            {languageControl}
            <a
              className="header-market"
              href="#black-friday"
              onClick={() => chooseStores()}
              aria-label={copy.destination}
            >
              {country ? (
                <DirectMarketFlag market={country.id} />
              ) : (
                <Globe2 size={17} />
              )}
              <span>
                {country ? country.country[language] : copy.destination}
              </span>
              <ChevronDown size={13} />
            </a>
            <button
              className="mobile-menu-button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={copy.menu}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav id="mobile-navigation" className="mobile-navigation">
            {navigation.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#markets" onClick={() => setMobileOpen(false)}>
              {copy.destination}
            </a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>
              {copy.navFaq}
            </a>
          </nav>
        )}
      </header>

      <main id="main">
        <section className="hero section-shell">
          <div className="hero-copy">
            <div className="campaign-label">
              <span className="red-dot" />
              {copy.campaign}
              <span className="rp-preview">{r.preview}</span>
              <span className="campaign-year" dir="ltr">
                2026
              </span>
            </div>
            <h1 className="font-serif">
              <span>{copy.heroLine1}</span>
              {copy.heroLine2 && (
                <span className="red-line">
                  {isAf ? regional.heroLine2 : copy.heroLine2}
                </span>
              )}
            </h1>
            <p className="hero-eyebrow">{copy.heroEyebrow}</p>
            <p className="hero-body">{copy.heroBody}</p>
            <div className="hero-actions">
              <a
                className="button primary hero-button"
                href={potPurchaseUrl || "#black-friday"}
                target={potPurchaseUrl ? "_blank" : undefined}
                rel={potPurchaseUrl ? "noopener noreferrer" : undefined}
                onClick={() =>
                  potPurchaseUrl ? setProduct("pot") : chooseStores("pot")
                }
              >
                {getDirectActionLabel(language, "pot", directMarket)}
                <Arrow size={20} />
              </a>
              <a
                className="button outline hero-mandoline-button"
                href="#mandoline"
              >
                {mandolineUnavailable
                  ? copy.exploreMandoline
                  : copy.heroSecondary}
                <Arrow size={16} />
              </a>
            </div>
            <div className="rp-hero-trust">
              <a href="#reviews">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>
                  {r.score}
                  <small>{r.scoreDate}</small>
                </span>
              </a>
              <a href="#delivery">
                <Globe2 size={16} aria-hidden="true" />
                <span>{r.storeTrust}</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="tiny-line" />
              <span>{copy.heroOfferDates}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-arch">
              <div
                className="hero-kitchen-backdrop"
                aria-hidden="true"
                style={{ backgroundImage: `url("${media.heroKitchenScene}")` }}
              />
              <div className="hero-red-halo" aria-hidden="true" />
              <img
                src={media.potHero}
                alt={alt.pot}
                fetchPriority="high"
                decoding="async"
                className="hero-product-image"
              />
              <p className="hero-scene-message">{copy.heroSceneMessage}</p>
            </div>
            <button
              className="hero-cooking-peek"
              onClick={() => openVideo("pot")}
            >
              <img src={media.potDemoPoster} alt="" width="150" height="100" />
              <span className="hero-peek-play">
                <Play size={16} fill="currentColor" />
              </span>
              <span>{c.potVideoAction}</span>
            </button>
          </div>
          <ImprovedHeroOffers
            language={language}
            copy={copy}
            quantity={quantity}
            market={market}
            onQuantityChange={next => {
              setQuantity(next);
              setProduct("pot");
            }}
          />
        </section>

        <section className="rp-selection section-shell" id="black-friday">
          <span id="markets" className="section-anchor" />
          <div className="rp-section-heading">
            <p className="eyebrow">{r.chooseEyebrow}</p>
            <h2 id="direct-store-heading" tabIndex={-1} className="font-serif">
              {direct.title}
            </h2>
            <p>{direct.body}</p>
          </div>
          <DirectStoreLinks
            language={language}
            copy={copy}
            preference={preference}
            product={product}
            onProductChange={setProduct}
            onMarketChange={changeMarket}
          />
        </section>

        <section className="spec-strip" aria-label={c.featureTitle}>
          <div className="section-shell spec-strip-inner">
            <div>
              <span>{r.specCapacity}</span>
              <strong>
                {[7, 9, 12]
                  .map(size => formatCapacity(size, language))
                  .join(" / ")}{" "}
                <small>{copy.litres}</small>
              </strong>
            </div>
            <div>
              <span>{c.specOven}</span>
              <strong>
                <bdi>{formatCapacity(180, language)}°C</bdi>
              </strong>
            </div>
            <div>
              <span>{c.specBody}</span>
              <strong className="spec-material">{c.specBodyValue}</strong>
            </div>
          </div>
        </section>

        <span id="collection" className="section-anchor" />
        <section
          className="product-section section-shell campaign-pot"
          id="pot"
        >
          <div className="product-media pot-product-media">
            <div className="product-photo">
              <img
                src={media.potDetail}
                alt={alt.pot}
                loading="lazy"
                width="850"
                height="900"
              />
            </div>
          </div>
          <div className="product-copy">
            <p className="eyebrow">{copy.potEyebrow}</p>
            <h2 className="line-heading font-serif">{c.potIntro}</h2>
            <p className="product-intro">{copy.potBody}</p>
            <div className="feature-list pot-features">
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
                title={copy.capacity}
                text={copy.capacityHint}
              />
            </div>
            <details className="rp-care-details">
              <summary>{r.guideDetails}</summary>
              <div className="feature-list">
                {" "}
                <Feature
                  icon={<Leaf />}
                  title={copy.potMaterialTitle}
                  text={copy.potMaterialBody}
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
              </div>
            </details>
            <div className="capacity-picker ds-capacity-info">
              <span className="field-heading">{copy.capacity}</span>
              <div className="ds-size-labels">
                {[7, 9, 12].map(size => (
                  <span key={size}>
                    {formatCapacity(size, language)} {copy.litres}
                  </span>
                ))}
              </div>
              <p className="microcopy">{direct.finalChoice}</p>
            </div>
            <a
              className="button primary product-buy"
              href={potPurchaseUrl || "#black-friday"}
              target={potPurchaseUrl ? "_blank" : undefined}
              rel={potPurchaseUrl ? "noopener noreferrer" : undefined}
              onClick={() =>
                potPurchaseUrl ? setProduct("pot") : chooseStores("pot")
              }
            >
              {getDirectActionLabel(language, "pot", directMarket)}
              <Arrow size={19} />
            </a>
            <p className="safety-note">
              <ShieldCheck size={16} />
              <span>{copy.potSafety}</span>
            </p>
          </div>
        </section>

        <Testimonials language={language} />

        <section className="rp-risk section-shell" id="delivery">
          <div className="rp-section-heading">
            <p className="eyebrow">{r.riskEyebrow}</p>
            <h2 className="font-serif">{r.riskTitle}</h2>
          </div>
          <div className="rp-risk-columns">
            <article>
              <Globe2 aria-hidden="true" />
              <h3 className="font-serif">{r.shippingTitle}</h3>
              <p>{r.shippingBody}</p>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <h3 className="font-serif">{r.returnsTitle}</h3>
              <p>{r.returnsBody}</p>
            </article>
            <article>
              <MessageCircle aria-hidden="true" />
              <h3 className="font-serif">{r.supportTitle}</h3>
              <p>{r.supportBody}</p>
              <a
                className="text-link"
                href={rayhanaSupportWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.supportAction}
                <ArrowUpRight size={16} />
              </a>
            </article>
          </div>
          <a
            className="button outline"
            href="#black-friday"
            onClick={() => chooseStores()}
          >
            {direct.primary}
            <Arrow size={18} />
          </a>
        </section>

        <section className="quality-section" id="quality">
          <div className="section-shell quality-inner">
            <div className="quality-copy">
              <p className="eyebrow">{c.qualityEyebrow}</p>
              <h2 className="line-heading campaign-heading font-serif">
                {c.qualityTitle}
              </h2>
              <p className="quality-intro">{c.qualityBody}</p>
              <div className="proof-list">
                {c.proofItems.map((item, index) => (
                  <div className="proof-item" key={item.title}>
                    <span className="proof-number">
                      {formatCapacity(index + 1, language)}
                    </span>
                    <div>
                      <h3 className="font-serif">{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                className="button outline quality-guide-download"
                href={media.potGuide}
                download="rayhana-pot-guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={16} />
                {copy.downloadPotGuide}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="cooking-media">
              <CookingVideoSlider language={language} copy={c} />
            </div>
          </div>
        </section>

        <section className="mandoline-section" id="mandoline">
          <div className="product-section section-shell mandoline-layout">
            <div className="product-copy">
              <p className="eyebrow">{copy.mandolineEyebrow}</p>
              <span className="mandoline-offer-badge">
                {mandolineUnavailable
                  ? regional.unavailableTitle
                  : copy.mandolineOfferBadge}
              </span>
              <h2 className="line-heading font-serif">{copy.mandolineTitle}</h2>
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
                  icon={<Soup />}
                  title={copy.potatoTitle}
                  text={copy.potatoBody}
                />
                <Feature
                  icon={<SlidersHorizontal />}
                  title={m.bladeTitle}
                  text={m.bladeBody}
                />
                <Feature
                  icon={<Check />}
                  title={m.antiSlipTitle}
                  text={m.antiSlipBody}
                />
                <Feature
                  icon={<ShieldCheck />}
                  title={copy.holderTitle}
                  text={copy.holderBody}
                />
              </div>
              <details className="rp-care-details ds-mandoline-specs">
                <summary>{m.detailsLabel}</summary>
                <dl className="ds-specs-list">
                  <dt>{m.steelGradesLabel}</dt>
                  <dd>
                    <bdi dir="ltr">
                      {mandolineProductFacts.componentSteelGrades.join(" / ")}
                    </bdi>
                    <small>{m.steelGradesNote}</small>
                  </dd>
                  <dt>{m.otherMaterialsLabel}</dt>
                  <dd>
                    <bdi dir="ltr">
                      {mandolineProductFacts.otherComponentMaterials.join(
                        " / "
                      )}
                    </bdi>
                    {language === "en" ? "; " : "؛ "}
                    {m.platedIron}
                  </dd>
                  <dt>{m.weightLabel}</dt>
                  <dd>
                    {formatCapacity(
                      mandolineProductFacts.productWeightGrams,
                      language
                    )}{" "}
                    {m.grams}
                  </dd>
                  <dt>{m.cleaningLabel}</dt>
                  <dd>{m.cleaningBody}</dd>
                </dl>
              </details>
              <div className="product-actions">
                <a
                  className="button primary"
                  href={mandolinePurchaseUrl || "#black-friday"}
                  target={mandolinePurchaseUrl ? "_blank" : undefined}
                  rel={mandolinePurchaseUrl ? "noopener noreferrer" : undefined}
                  onClick={() =>
                    mandolinePurchaseUrl
                      ? setProduct("mandoline")
                      : chooseStores("mandoline")
                  }
                >
                  {getDirectActionLabel(language, "mandoline", directMarket)}
                  <Arrow size={18} />
                </a>
                <a
                  className="button outline"
                  href="#mandoline-demo"
                  onClick={() => setDemoEnabled(true)}
                >
                  <Play size={16} fill="currentColor" />
                  {copy.watchDemo}
                </a>
              </div>
              <p className="safety-note">
                <ShieldCheck size={16} />
                <span>{copy.mandolineSafety}</span>
              </p>
              {media.mandolineGuide && (
                <a
                  className="guide-link"
                  href={media.mandolineGuide}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.readGuide}
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
            <div className="mandoline-gallery">
              <div className="gallery-main">
                <img
                  src={media.mandolineGallery[gallery]}
                  alt={alt.mandoline[gallery]}
                  width="900"
                  height="700"
                  loading="lazy"
                />
                <ViewportVideo
                  language={language}
                  copy={copy}
                  poster={media.mandolineGallery[gallery]}
                  enabled={demoEnabled}
                  suspended={videoOpen}
                />
                {!demoEnabled && (
                  <a
                    className="video-pill ds-demo-link"
                    href="#mandoline-demo"
                    onClick={() => setDemoEnabled(true)}
                  >
                    <span className="play-circle">
                      <Play size={13} fill="currentColor" />
                    </span>
                    {copy.watchDemo}
                  </a>
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
                      setGallery(index);
                      setDemoEnabled(false);
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

        <section className="faq-section section-shell" id="faq">
          <div className="faq-heading">
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2 className="font-serif">{copy.faqTitle}</h2>
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
                  <p
                    className={index === 4 ? "ds-mandoline-answer" : undefined}
                  >
                    {item.a}
                    {index === 0 && <> {location.germanyCoverage}</>}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
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

        <Community language={language} />

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
            <h2 className="line-heading campaign-heading font-serif">{c.nextTitle}</h2>
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

        <section className="closing-section">
          <div className="closing-pattern" aria-hidden="true" />
          <p className="eyebrow">RAYHANA KITCHEN APPLIANCE</p>
          <h2 className="line-heading font-serif">{copy.closingTitle}</h2>
          <p className="closing-description">{copy.closingBody}</p>
          <div className="closing-actions">
            <a
              className="button light"
              href={potPurchaseUrl || "#black-friday"}
              target={potPurchaseUrl ? "_blank" : undefined}
              rel={potPurchaseUrl ? "noopener noreferrer" : undefined}
              onClick={() =>
                potPurchaseUrl ? setProduct("pot") : chooseStores("pot")
              }
            >
              {getDirectActionLabel(language, "pot", directMarket)}
              <Arrow size={19} />
            </a>
            <a className="button outline" href="#mandoline">
              {copy.closingSecondary}
              <Arrow size={19} />
            </a>
          </div>
        </section>
      </main>

      <footer className={`site-footer section-shell${campaignRoute ? " redesign-chrome-hidden" : ""}`}>
        <div className="footer-main">
          <div className="footer-brand">
            <a href={campaignRoute ? "/" : `/improved/${language}`}>
              <img
                src={media.logo}
                alt="RAYHANA — Roots in Modern Life"
                width="180"
                height="49"
                loading="lazy"
              />
            </a>
            <p>{copy.footerTagline}</p>
            <span>{copy.footerCompany}</span>
          </div>
          <div className="footer-column">
            <h3 className="font-serif">{copy.footerProducts}</h3>
            <a href="#pot">{copy.potName}</a>
            <a href="#mandoline">{copy.mandolineName}</a>
            <a href="#community">{c.navCommunity}</a>
            <a href="#markets">{copy.destination}</a>
          </div>
          <div className="footer-column">
            <h3 className="font-serif">{copy.footerHelp}</h3>
            <a href="#faq">{copy.navFaq}</a>
            <a href="#reviews">{c.reviewsAction}</a>
            <a
              href="https://www.rayhana.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.footerOfficial}
              <ArrowUpRight size={13} />
            </a>
            <a href="mailto:info@rayhana.com">{copy.footerContact}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{copy.copyright}</span>
          <a href="#main">
            {copy.backToTop}
            <ArrowDown size={14} className="point-up" />
          </a>
        </div>
      </footer>
      <div
        className={`mobile-sticky ds-sticky-buy ${sticky ? "visible" : ""}`}
        aria-hidden={!sticky}
        data-market={currentStore?.id || ""}
        data-product={product}
      >
        <a
          className="ds-sticky-store"
          href="#black-friday"
          tabIndex={sticky ? 0 : -1}
          onClick={() => chooseStores()}
        >
          {currentStore ? (
            <DirectMarketFlag market={currentStore.id} />
          ) : (
            <Globe2 size={18} aria-hidden="true" />
          )}
          <span>
            <strong>{currentProductName}</strong>
            <small>
              {currentStore
                ? getDirectMarketLabel(currentStore.id, language)
                : copy.destination}
            </small>
          </span>
        </a>
        <a
          className="button primary"
          tabIndex={sticky ? 0 : -1}
          href={currentPurchaseUrl || "#black-friday"}
          target={currentPurchaseUrl ? "_blank" : undefined}
          rel={currentPurchaseUrl ? "noopener noreferrer" : undefined}
          onClick={() => !currentPurchaseUrl && chooseStores()}
        >
          {getDirectActionLabel(language, product, directMarket)}
          <Arrow size={16} />
        </a>
      </div>
      <span role="status" className="sr-only" aria-live="polite">
        {status}
      </span>
      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        language={language}
        copy={copy}
        product={videoProduct}
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
        <h3 className="font-serif">{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
