import { useTranslation } from "react-i18next";

export default function FullPageLoader() {
  const { t, i18n } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          {t("common.loading", "Loading...")}
        </p>
      </div>
    </div>
  );
}
