import React, { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { MarketPreference } from "@/blackfriday/redesign/data/marketPreference";
import { purchasePlannerCopy } from "@/blackfriday/redesign/data/purchasePlannerCopy";
import PurchasePlanner, { type PurchasePlannerProps } from "./PurchasePlanner";

export type RefinedBuyingDialogProps = PurchasePlannerProps & {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  /** Accepted for existing parent integrations; country stays fully controlled. */
  preference?: MarketPreference;
};

export default function RefinedBuyingDialog({
  open,
  onOpenChange,
  preference: _preference,
  ...plannerProps
}: RefinedBuyingDialogProps) {
  const heading = useRef<HTMLHeadingElement | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const c = purchasePlannerCopy[plannerProps.language];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rp-dialog-overlay" />
        <Dialog.Content
          className="buy-dialog refined-buy-dialog rp-dialog"
          dir={plannerProps.language === "en" ? "ltr" : "rtl"}
          onOpenAutoFocus={event => {
            event.preventDefault();
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            heading.current?.focus();
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            if (returnFocus.current?.isConnected) returnFocus.current.focus();
          }}
        >
          <Dialog.Close
            className="rp-dialog-close"
            aria-label={plannerProps.copy.close}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <X size={20} aria-hidden="true" />
          </Dialog.Close>
          <Dialog.Title className="rp-dialog-title font-serif" ref={heading} tabIndex={-1}>
            {c.title}
          </Dialog.Title>
          <Dialog.Description className="rp-dialog-description">
            {c.intro}
          </Dialog.Description>
          <div className="rp-dialog-body">
            <PurchasePlanner
              {...plannerProps}
              compact={plannerProps.compact ?? true}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
