import { useTranslation } from "react-i18next";

export default function FullPageLoader() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-sm transition-colors">
      <div className="flex flex-col items-center gap-3 text-foreground">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin shadow-lg shadow-primary/20 dark:shadow-black/40" />
        <p className="text-sm text-muted-foreground">
          {t("common.loading", "Loading...")}
        </p>
      </div>
    </div>
  );
}
