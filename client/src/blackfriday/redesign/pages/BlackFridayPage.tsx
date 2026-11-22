import { useTranslation } from "react-i18next";
import HomeImproved from "./HomeImproved";
import type { Language } from "@/blackfriday/redesign/data/catalog";

export default function BlackFridayRedesignPage() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "fa").split("-")[0];
  const language: Language = current === "en" || current === "ps" ? current : "fa";

  return (
    <HomeImproved
      initialLanguage={language}
      campaignRoute
      onLanguageChange={next => void i18n.changeLanguage(next)}
    />
  );
}
