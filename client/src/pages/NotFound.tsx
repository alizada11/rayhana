import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import SeoTags from "@/components/SeoTags";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-stone-900 dark:via-stone-950 dark:to-black">
      <SeoTags
        pageKey="404"
        title={t("not_found.meta_title", "404 | Page Not Found")}
        description={t("not_found.meta_desc", "This page could not be found.")}
        url={`${import.meta.env.VITE_BASE_URL || ""}/404`}
      />
      <Card className="w-full max-w-lg mx-4 shadow-lg border border-border bg-card/90 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500 dark:text-red-300" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            {t("not_found.title", "Page Not Found")}
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t(
              "not_found.body",
              "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted."
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              {t("not_found.go_home", "Go Home")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
