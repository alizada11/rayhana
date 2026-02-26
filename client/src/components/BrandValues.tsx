import React from "react";
import { useTranslation } from "react-i18next";
import { Leaf, Heart, Gem, Lightbulb, Fingerprint } from "lucide-react";

const valueItems = [
  { icon: Fingerprint, key: "authenticity" },
  { icon: Lightbulb, key: "innovation" },
  { icon: Gem, key: "quality" },
  { icon: Heart, key: "connection" },
  { icon: Leaf, key: "simplicity" },
];

export default function BrandValues() {
  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);

  return (
    <section className="container">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {t("brand_values.title")}
          </h2>
        </div>

        {/* Mobile/Tablet: stacked cards, no connectors */}
        <div className="grid gap-10 sm:grid-cols-2 md:hidden" dir={isRTL ? "rtl" : "ltr"}>
          {valueItems.map(({ icon: Icon, key }) => (
            <div key={key} className="text-center">
              <div className="relative z-10 mx-auto w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center bg-white dark:bg-gray-950 text-primary mb-4">
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {t(`brand_values.items.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                {t(`brand_values.items.${key}.subtitle`)}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop: horizontal with dashed connectors */}
        <div
          className="hidden md:flex justify-between items-start w-full"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {valueItems.map(({ icon: Icon, key }, index) => (
            <React.Fragment key={key}>
              {/* Value item - each takes equal space */}
              <div className="flex-1 text-center">
                {/* Icon with background to cover any connector */}
                <div className="relative z-10 mx-auto w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center bg-white dark:bg-gray-950 text-primary mb-4">
                  <Icon className="w-9 h-9" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  {t(`brand_values.items.${key}.title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground max-w-[160px] mx-auto leading-relaxed">
                  {t(`brand_values.items.${key}.subtitle`)}
                </p>
              </div>

              {/* Connector between items - fills the space between */}
              {index < valueItems.length - 1 && (
                <div
                  className="flex-1 max-w-[60px] md:flex items-start justify-center"
                  style={{ paddingTop: "2.5rem" }}
                >
                  <div className="w-full border-t-2 border-dashed border-primary/30" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
