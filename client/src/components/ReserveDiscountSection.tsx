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
import type { Product } from "@/hooks/useProducts";
import { useAuth } from "@/lib/auth";
import { CheckCircle, Gift, Loader2, Mail, ShieldCheck } from "lucide-react";
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

const regions = [
  "EU",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Arabic Countries",
  "Afghanistan",
];

const normalizeWhatsapp = (value: string) => value.replace(/[\s().-]/g, "");
const isValidWhatsapp = (value: string) => /^\+[1-9]\d{6,14}$/.test(value);

export default function ReserveDiscountSection({
  products,
  localize,
}: ReserveDiscountSectionProps) {
  const { t } = useTranslation();
  const { user, isLoaded, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
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
        onSuccess: () => {
          toast.success(
            t("reserve_discount.toast.success", "Your discount is reserved")
          );
          setOpen(false);
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

  return (
    <section className="max-w-5xl mx-auto mb-24">
      <div className="border border-primary/15 bg-card text-card-foreground rounded-lg p-6 md:p-10 shadow-sm">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <div className="space-y-5">
            <Badge className="mx-auto w-fit rounded-md bg-primary text-primary-foreground">
              {t("reserve_discount.badge", "Pre-launch offer")}
            </Badge>
            <div className="space-y-3">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
                {t("reserve_discount.title", "Reserve your 15% discount")}
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {t(
                  "reserve_discount.description",
                  "We are launching on Amazon EU and UK soon. Reserve your code now and we will email you the moment your region goes live."
                )}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                t("reserve_discount.features.discount", "15% launch code"),
                t("reserve_discount.features.payment", "No payment today"),
                t("reserve_discount.features.alert", "Email launch alert"),
              ].map(item => (
                <div
                  key={item}
                  className="flex items-center justify-center gap-2 text-sm text-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="rounded-md px-6"
            disabled={products.length === 0}
            onClick={() => setOpen(true)}
          >
            <Gift className="mr-2 h-4 w-4" />
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
    </section>
  );
}
