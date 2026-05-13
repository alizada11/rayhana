import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      position="top-center"
      closeButton
      duration={4200}
      className="toaster group"
      toastOptions={{
        className:
          "rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)] backdrop-blur-md text-slate-900 ring-1 ring-white/60 dark:border-slate-800/70 dark:bg-slate-900/85 dark:text-slate-50",
        descriptionClassName:
          "text-sm text-slate-600/90 dark:text-slate-300/90 leading-relaxed",
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-rose-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-sky-500" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
