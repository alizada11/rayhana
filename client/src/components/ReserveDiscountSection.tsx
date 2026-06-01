import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePreLaunchReservation,
  useMyPreLaunchReservations,
} from "@/hooks/usePreLaunchReservations";
import eidImage from "@/assets/eid.png";
import type { Product } from "@/hooks/useProducts";
import type { PreLaunchReservation } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Check,
  CheckCircle,
  Gift,
  Loader2,
  Mail,
  Moon,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "wouter";

type ReserveDiscountSectionProps = {
  products: Product[];
  localize: (value: unknown) => string;
};

type FormState = {
  productId: string;
  productSize: string;
  fullName: string;
  email: string;
  whatsapp: string;
  region: string;
};

const defaultForm: FormState = {
  productId: "",
  productSize: "",
  fullName: "",
  email: "",
  whatsapp: "",
  region: "",
};

const regions = ["EU", "United Kingdom"];

const normalizeWhatsapp = (value: string) => value.replace(/[\s().-]/g, "");
const isValidWhatsapp = (value: string) => /^\+[1-9]\d{6,14}$/.test(value);

export default function ReserveDiscountSection({
  products,
  localize,
}: ReserveDiscountSectionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { user, isLoaded, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [successReservation, setSuccessReservation] =
    useState<PreLaunchReservation | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const createReservation = useCreatePreLaunchReservation();
  const myReservations = useMyPreLaunchReservations(isLoaded && isSignedIn);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const selectedProduct = useMemo(
    () => products.find(product => String(product.id) === form.productId),
    [form.productId, products]
  );

  const sizeOptions = useMemo(() => {
    const sizes = selectedProduct?.sizes;
    if (Array.isArray(sizes) && sizes.length > 0) return sizes.map(String);
    return ["7", "9", "12"];
  }, [selectedProduct]);

  useEffect(() => {
    if (!open) return;
    const firstProduct = products[0];
    const firstSize = Array.isArray(firstProduct?.sizes)
      ? String(firstProduct.sizes[0] ?? "")
      : "7";
    setForm({
      ...defaultForm,
      productId: firstProduct ? String(firstProduct.id) : "",
      productSize: firstSize,
      fullName: user?.name || "",
      email: user?.email || "",
    });
    setErrors({});
  }, [open, products, user?.email, user?.name]);

  useEffect(() => {
    if (!form.productId) return;
    if (!sizeOptions.includes(form.productSize)) {
      setForm(prev => ({ ...prev, productSize: sizeOptions[0] || "" }));
    }
  }, [form.productId, form.productSize, sizeOptions]);

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.productId)
      nextErrors.productId = t(
        "reserve_discount.errors.product",
        "Choose a product"
      );
    if (!form.productSize)
      nextErrors.productSize = t(
        "reserve_discount.errors.size",
        "Choose a size"
      );
    if (form.fullName.trim().length < 2)
      nextErrors.fullName = t(
        "reserve_discount.errors.name",
        "Enter your name"
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = t(
        "reserve_discount.errors.email",
        "Enter a valid email"
      );
    }
    if (!isValidWhatsapp(normalizeWhatsapp(form.whatsapp))) {
      nextErrors.whatsapp = t(
        "reserve_discount.errors.whatsapp",
        "Use a country code, for example +447700900123"
      );
    }
    if (!form.region)
      nextErrors.region = t(
        "reserve_discount.errors.region",
        "Choose your region"
      );
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    createReservation.mutate(
      {
        productId: form.productId,
        productSize: form.productSize,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        whatsapp: normalizeWhatsapp(form.whatsapp),
        region: form.region,
      },
      {
        onSuccess: reservation => {
          setOpen(false);
          setSuccessReservation(reservation);
        },
        onError: (error: any) => {
          if (error?.response?.status === 409) {
            toast.error(
              t(
                "reserve_discount.toast.duplicate",
                "You already reserved this product and size with this email."
              )
            );
            return;
          }
          const message =
            error?.response?.data?.error ||
            t("reserve_discount.toast.error", "Reservation could not be saved");
          toast.error(message);
        },
      }
    );
  };

  const reservationItems = myReservations.data ?? [];
  const successProductName =
    localize(successReservation?.product?.title) ||
    t("reserve_discount.reservations.product_fallback", "Rayhana pot");

  return (
    <>
      {/*
    <section className="relative mx-auto mb-24 w-full max-w-[90rem] overflow-x-clip px-3 pt-24 sm:px-4 sm:pt-28">
      <img
        src={eidImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-20 w-[min(74vw,20rem)] -translate-x-1/2 select-none object-contain sm:w-[23rem] md:w-[26rem]"
      />
      <div className="relative w-full max-w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fff4ec] via-[#ffeadf] to-[#fff3d6] px-4 pb-16 pt-20 text-[#061526] shadow-sm sm:px-10 sm:pb-16 sm:pt-24 md:px-16 lg:px-24">
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-[#efd1c7]/45 sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -right-8 top-0 h-44 w-44 rounded-full bg-[#efd2aa]/45 sm:-right-10 sm:h-52 sm:w-52" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-9 text-center">
          <div className="space-y-6">
            <Badge className="mx-auto flex w-full max-w-full shrink items-center justify-center gap-2 whitespace-normal rounded-md border-0 bg-[#d51b2a] px-3 py-2 text-center text-[clamp(0.9rem,3.8vw,1.5rem)] font-extrabold uppercase leading-tight tracking-[0.06em] text-white shadow-none hover:bg-[#d51b2a] min-[420px]:w-fit sm:max-w-full sm:px-5 sm:tracking-[0.12em] [&>svg]:!size-6">
              <Moon
                aria-hidden="true"
                className={`h-6 w-6 shrink-0 fill-yellow-300 text-yellow-300 ${
                  isRTL ? "rotate-270" : "-rotate-12"
                }`}
              />
              <span className="min-w-0 break-words">
                {t("reserve_discount.badge", "Pre-launch offer")}
              </span>
            </Badge>
            <div className="space-y-5">
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-primary">
                {t("reserve_discount.title", "Reserve your 15% discount")}
              </h2>
              <p className="mx-auto max-w-4xl text-lg leading-8 text-[#061526] md:text-xl">
                {t(
                  "reserve_discount.description",
                  "We are launching on Amazon EU and UK soon. Reserve your code now and we will email you the moment your region goes live."
                )}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-10">
              {[
                t("reserve_discount.features.discount", "15% launch code"),
                t("reserve_discount.features.payment", "No payment today"),
                t("reserve_discount.features.alert", "Email launch alert"),
              ].map(item => (
                <div
                  key={item}
                  className="flex items-center justify-center gap-3 text-base text-[#061526]"
                >
                  <Check className="h-4 w-4 stroke-[3] text-[#d51b2a]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#d51b2a] px-8 text-lg font-bold text-white shadow-none hover:bg-[#b91623] sm:px-11"
            disabled={products.length === 0}
            onClick={() => setOpen(true)}
          >
            <Check className="h-5 w-5 stroke-[3]" />
            {t("reserve_discount.cta", "Reserve your discount")}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
        {isSignedIn ? (
          myReservations.isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(
                "reserve_discount.reservations.loading",
                "Loading your reservations"
              )}
            </div>
          ) : reservationItems.length > 0 ? (
            <div className="space-y-3">
              {reservationItems.map(reservation => (
                <div
                  key={reservation.id}
                  className="flex flex-wrap items-center justify-center gap-3 text-center text-sm sm:justify-between sm:text-start"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      {t(
                        "reserve_discount.reservations.item_prefix",
                        "Your reserved item:"
                      )}{" "}
                      <strong>
                        {localize(reservation.product?.title) ||
                          t(
                            "reserve_discount.reservations.product_fallback",
                            "Rayhana pot"
                          )}
                      </strong>{" "}
                      {t("reserve_discount.reservations.size", "size")}{" "}
                      {reservation.productSize}
                    </span>
                  </div>
                  <Badge variant="outline" className="rounded-md capitalize">
                    {t(
                      `reserve_discount.status.${reservation.status}`,
                      reservation.status
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {t(
                "reserve_discount.reservations.empty",
                "You do not have a pre-launch reservation yet."
              )}
            </p>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <span>
              {t(
                "reserve_discount.reservations.login_prompt",
                "Already have an account?"
              )}
            </span>
            <Link href="/login" className="font-medium text-primary underline">
              {t(
                "reserve_discount.reservations.login_link",
                "Login to manage your reservation."
              )}
            </Link>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">
              {t("reserve_discount.modal.title", "Reserve your 15% discount")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "reserve_discount.modal.description",
                "No payment, no commitment. We will send your code when the Amazon shop launches in your region."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("reserve_discount.form.product", "Product")}</Label>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                {products.map(product => {
                  const productId = String(product.id);
                  const productSizes = Array.isArray(product.sizes)
                    ? product.sizes.map(String)
                    : ["7", "9", "12"];
                  const selected = productId === form.productId;

                  return (
                    <div
                      key={product.id}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onClick={() => {
                        setField("productId", productId);
                        setField("productSize", productSizes[0] || "");
                      }}
                      onKeyDown={event => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        setField("productId", productId);
                        setField("productSize", productSizes[0] || "");
                      }}
                      className={`group overflow-hidden rounded-lg border bg-card text-start shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-border"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-secondary/20">
                        {product.imageUrl ? (
                          <img
                            src={resolveImageUrl(product.imageUrl)}
                            alt={localize(product.title)}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                            {t("reserve_discount.form.no_image", "No image")}
                          </div>
                        )}
                        {selected && (
                          <div className="absolute right-3 top-3 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 p-3">
                        <div className="font-serif text-base font-bold text-foreground">
                          {localize(product.title)}
                        </div>
                        {localize(product.description) && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {localize(product.description)}
                          </p>
                        )}
                        <div
                          className="flex flex-wrap gap-2"
                          onClick={event => event.stopPropagation()}
                        >
                          {productSizes.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setField("productId", productId);
                                setField("productSize", size);
                              }}
                              className={`h-8 min-w-8 rounded-full px-2 text-sm transition-colors ${
                                selected && form.productSize === size
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-foreground hover:bg-secondary/80"
                              }`}
                              aria-label={t(
                                "reserve_discount.form.size_aria",
                                "Select size {{size}}",
                                { size }
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.productId && (
                <p className="text-xs text-destructive">{errors.productId}</p>
              )}
              {errors.productSize && (
                <p className="text-xs text-destructive">{errors.productSize}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-name">
                {t("reserve_discount.form.full_name", "Full name")}
              </Label>
              <Input
                id="reservation-name"
                value={form.fullName}
                onChange={event => setField("fullName", event.target.value)}
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-email">
                {t("reserve_discount.form.email", "Email")}
              </Label>
              <Input
                id="reservation-email"
                type="email"
                value={form.email}
                onChange={event => setField("email", event.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-whatsapp">
                {t("reserve_discount.form.whatsapp", "WhatsApp")}
              </Label>
              <Input
                id="reservation-whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={event => setField("whatsapp", event.target.value)}
                placeholder="+447700900123"
                autoComplete="tel"
              />
              {errors.whatsapp && (
                <p className="text-xs text-destructive">{errors.whatsapp}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>{t("reserve_discount.form.region", "Region")}</Label>
              <Select
                value={form.region}
                onValueChange={value => setField("region", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t(
                      "reserve_discount.form.region_placeholder",
                      "Choose your region"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {t(`reserve_discount.regions.${region}`, region)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-xs text-destructive">{errors.region}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submit} disabled={createReservation.isPending}>
              {createReservation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Gift className="mr-2 h-4 w-4" />
              )}
              {t("reserve_discount.modal.submit", "Reserve my discount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {successReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white text-gray-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setSuccessReservation(null)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label={t("reserve_discount.success.close", "Close")}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 text-center md:p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 animate-ping rounded-full bg-green-100 opacity-75" />
                </div>
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>

              <h3 className="mb-2 font-serif text-2xl text-gray-800">
                {t(
                  "reserve_discount.success.title",
                  "Your discount is reserved!"
                )}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                {t(
                  "reserve_discount.success.description",
                  "We saved your 15% discount. The moment our Amazon shop launches in your region, you will receive your personal code by email."
                )}
              </p>

              <div className="mb-6 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-5 text-start">
                <div className="mb-3 flex items-center gap-2 border-b border-red-100 pb-2">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <strong className="text-sm text-red-700">
                    {t(
                      "reserve_discount.success.next_title",
                      "What happens next?"
                    )}
                  </strong>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  {[
                    t(
                      "reserve_discount.success.step_1",
                      "We launch on Amazon EU and UK in the coming weeks"
                    ),
                    t(
                      "reserve_discount.success.step_2",
                      "You receive your personal 15% discount code by email"
                    ),
                    t(
                      "reserve_discount.success.step_3",
                      "You use the code on our Amazon listing to claim your discount"
                    ),
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-gray-50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 text-start">
                  <span className="text-gray-500">
                    {t("reserve_discount.success.selection", "Your selection:")}
                  </span>
                  <span className="font-semibold text-gray-700 sm:text-end">
                    {successProductName} ·{" "}
                    {t("reserve_discount.reservations.size", "size")}{" "}
                    {successReservation.productSize}
                  </span>
                </div>
              </div>

              <Button
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3 font-bold text-white shadow-md transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg"
                onClick={() => setSuccessReservation(null)}
              >
                {t("reserve_discount.success.button", "Got it, thanks!")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
    */}
    </>
  );
}
