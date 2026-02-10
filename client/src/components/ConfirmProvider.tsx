import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(v: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((opts = {}) => {
    return new Promise(resolve => {
      setOptions(opts);
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      if (resolver) resolver(result);
      setOpen(false);
    },
    [resolver]
  );

  const value = useMemo(() => confirm, [confirm]);

  const {
    title = t("confirm.title", "Are you sure?"),
    description = t("confirm.description", "This action cannot be undone."),
    confirmText = t("confirm.confirm", "Confirm"),
    cancelText = t("confirm.cancel", "Cancel"),
    tone = "danger",
  } = options;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif flex items-center gap-2 text-lg font-semibold">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed text-slate-600 dark:text-slate-300">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                tone === "danger"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
              }
              onClick={() => handleClose(true)}
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
