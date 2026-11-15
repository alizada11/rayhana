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
import VideoDialog from "@/blackfriday/components/rayhana/VideoDialog";
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
  potAmazonLabel,
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
  const [videoProduct, setVideoProduct] = useState<ProductId>("pot");
  const [videoOpen, setVideoOpen] = useState(false);
  const [gallery, setGallery] = useState(0);
  const [sticky, setSticky] = useState(false);
  const [status, setStatus] = useState("");
  const campaignRoot = useRef<HTMLDivElement>(null);
  const copy = dictionaries[language];
  const c = campaignCopy[language];
  const offer = blackFridayCopy[language];
  const rtl = language !== "en";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const country = markets.find(m => m.id === market);
  const alt = translatedAlt[language];
  const location = locationCopy[language];
  const potLink = getPurchaseUrl("pot", market, capacity);
  const buyPotLabel = potAmazonLabel(
    language,
    market,
    country?.country[language],
    !!potLink
  );
  const stickyBuyLabel =
    country && getPurchaseUrl(product, market, capacity)
      ? formatLocationTemplate(location.amazon, country.country[language])
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
  function openVideo(next: ProductId) {
    setVideoProduct(next);
    setVideoOpen(true);
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
            <div className="hero-arch">
              <img
                src={media.potHero}
                alt={alt.pot}
                fetchPriority="high"
                decoding="async"
                className="hero-product-image"
              />
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
        </section>

        <section className="spec-strip" aria-label={c.featureTitle}>
          <div className="section-shell spec-strip-inner">
            <div>
              <span>{c.specCapacity}</span>
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
          <p className="spec-source section-shell">{c.specNote}</p>
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
            <div className="product-photo">
              <img
                src={media.potDetail}
                alt={alt.pot}
                loading="lazy"
                width="850"
                height="900"
              />
            </div>
            <div className="image-note">
              <Package size={19} />
              <span>{copy.potLadle}</span>
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
            <button
              className="button primary product-buy"
              onClick={() => openBuying("pot")}
            >
              {buyPotLabel}
              <Arrow size={19} />
            </button>
            <p className="safety-note">
              <ShieldCheck size={16} />
              <span>{copy.potSafety}</span>
            </p>
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
              <div className="proof-list">
                {c.proofItems.map((item, index) => (
                  <div className="proof-item" key={item.title}>
                    <span className="proof-number">
                      {formatCapacity(index + 1, language)}
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="cooking-media">
              <button className="cooking-card" onClick={() => openVideo("pot")}>
                <img
                  src={media.potDemoPoster}
                  alt={c.potVideoLabel}
                  loading="lazy"
                  width="464"
                  height="848"
                />
                <span className="cooking-caption">
                  <span className="cooking-play">
                    <Play size={25} fill="currentColor" />
                  </span>
                  <span>
                    <strong>{c.potVideoLabel}</strong>
                    <small>{c.potVideoAction}</small>
                  </span>
                  <ArrowUpRight size={22} />
                </span>
              </button>
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
            <div className="buy-capacity">
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
            </div>
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
                    {copy.marketAmazon} {item.country[language]}
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
                {media.demo && (
                  <button
                    className="button outline"
                    onClick={() => openVideo("mandoline")}
                  >
                    <Play size={16} fill="currentColor" />
                    {copy.watchDemo}
                  </button>
                )}
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
              <div className="gallery-main">
                <img
                  src={media.mandolineGallery[gallery]}
                  alt={alt.mandoline[gallery]}
                  width="900"
                  height="700"
                  loading="lazy"
                />
                {media.demo && (
                  <button
                    className="video-pill"
                    onClick={() => openVideo("mandoline")}
                  >
                    <span className="play-circle">
                      <Play size={13} fill="currentColor" />
                    </span>
                    {copy.watchDemo}
                  </button>
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
                    onClick={() => setGallery(index)}
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
      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        language={language}
        copy={copy}
        product={videoProduct}
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
