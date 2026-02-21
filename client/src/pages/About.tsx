import { useTranslation } from "react-i18next";
import { useContent } from "@/hooks/useContent";
import DOMPurify from "dompurify";
import SeoTags from "@/components/SeoTags";

export default function About() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "en" | "fa" | "ps";
  const { data: aboutContent } = useContent("about");

  const getLocalized = (obj: any, fallback: string) =>
    obj?.[currentLang] || obj?.en || fallback;
  const plain = (value: string) =>
    DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();

  const heroTitle = plain(
    getLocalized(aboutContent?.data?.hero?.title, t("about_page.title"))
  );
  const heroSubtitle = plain(
    getLocalized(aboutContent?.data?.hero?.subtitle, t("about_page.subtitle"))
  );
  const storyTitle = plain(
    getLocalized(aboutContent?.data?.story?.title, t("about_page.story_title"))
  );
  const storyBody = plain(
    getLocalized(aboutContent?.data?.story?.body, t("about_page.story_content"))
  );
  const missionTitle = plain(
    getLocalized(
      aboutContent?.data?.mission?.title,
      t("about_page.mission_title")
    )
  );
  const missionBody = plain(
    getLocalized(
      aboutContent?.data?.mission?.body,
      t("about_page.mission_content")
    )
  );
  const founderTitle = plain(
    getLocalized(
      aboutContent?.data?.founder?.title,
      t("about_page.founder_title")
    )
  );
  const founderBody = plain(
    getLocalized(
      aboutContent?.data?.founder?.body,
      t("about_page.founder_content")
    )
  );
  const quoteText = plain(
    getLocalized(
      aboutContent?.data?.quote?.text,
      t("about_page.quote", '"Rayhana is not just a product, it is a bridge connecting hearts to home."')
    )
  );
  const storyImage =
    typeof aboutContent?.data?.images?.story === "string"
      ? aboutContent.data.images.story
      : "";
  const founderImage =
    typeof aboutContent?.data?.images?.founder === "string"
      ? aboutContent.data.images.founder
      : "";

  return (
    <div className="min-h-screen">
      <SeoTags
        pageKey="about"
        title={heroTitle || t("about_page.title", "About Rayhana")}
        description={
          heroSubtitle || t("about_page.subtitle", "Our story and values.")
        }
        image={aboutContent?.data?.images?.story}
        url={`${import.meta.env.VITE_BASE_URL || ""}/about`}
      />
      {/* Hero */}
      <section className="relative py-24 bg-secondary/30">
        <div className="container text-center space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary">
            {heroTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              {storyImage ? (
                <img loading="lazy" 
                  src={storyImage} 
                  alt="Rayhana Story" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-background"
                  aria-hidden="true"
                />
              )}
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-primary">
                  {storyTitle}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {storyBody}
                </p>
              </div>
              
              <div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-primary">
                  {missionTitle}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {missionBody}
                </p>
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                {[
                  t('about.authenticity'),
                  t('about.innovation'),
                  t('about.quality'),
                  t('about.connection')
                ].map((value, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold text-primary">
                {founderTitle}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {founderBody}
              </p>
              <div className="pt-4 border-l-4 border-primary pl-6">
                <p className="text-sm text-muted-foreground italic">
                  {quoteText}
                </p>
              </div>
            </div>

            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              {founderImage ? (
                <img loading="lazy"
                  src={founderImage}
                  alt="Founder portrait"
                  className="w-full h-full object-cover"
                />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-background"
                    aria-hidden="true"
                  />
                )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
