import React, { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Language,
  media,
  ProductId,
} from "@/blackfriday/redesign/data/catalog";
import { campaignCopy } from "@/blackfriday/redesign/data/campaign";
import type { Copy } from "./BuyingDialog";
import CookingVideoSlider from "./CookingVideoSlider";

export default function VideoDialog({
  open,
  onOpenChange,
  language,
  copy,
  product = "mandoline",
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  language: Language;
  copy: Copy;
  product?: ProductId;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const pot = product === "pot";
  const c = campaignCopy[language];
  const source = pot ? media.potDemo : media.demo;
  const title = pot ? c.potVideoLabel : copy.videoLabel;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rayhana-video-overlay" />
        <Dialog.Content
          className="rayhana-video-dialog"
          dir={language === "en" ? "ltr" : "rtl"}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <Dialog.Close className="dialog-close" aria-label={copy.close}>
            <X size={22} />
          </Dialog.Close>
          <Dialog.Title className="font-serif">{title}</Dialog.Title>
          <Dialog.Description className={pot ? "sr-only" : undefined}>
            {pot ? c.potVideoAction : copy.videoNote}
          </Dialog.Description>
          {pot ? (
            <CookingVideoSlider
              language={language}
              copy={copy}
              variant="dialog"
            />
          ) : (
            <video
              key={source}
              controls
              playsInline
              autoPlay
              preload="metadata"
              poster={media.demoPoster}
              aria-label={title}
            >
              <source src={source} type="video/mp4" />
              <a href={source} download>
                {copy.videoFallback}
              </a>
            </video>
          )}
          <p className="video-safety">
            {pot ? copy.potSafety : copy.mandolineSafety}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
