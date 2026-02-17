import { useTranslation } from "react-i18next";

export default function FullPageLoader() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 dark:bg-background/80 backdrop-blur-sm transition-colors">
      <div className="flex flex-col items-center gap-3 text-foreground">
        <div className="h-12 w-12 rounded-full border-4 border-border/60 border-t-primary animate-spin shadow-[0_0_0_1px_rgb(var(--border))] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
        <p className="text-sm text-muted-foreground">
          {t("common.loading", "Loading...")}
        </p>
      </div>
    </div>
  );
}
