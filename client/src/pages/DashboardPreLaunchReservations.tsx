import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useConfirm } from "@/components/ConfirmProvider";
import {
  useCreatePreLaunchReservationAdmin,
  useDeletePreLaunchReservationAdmin,
  usePreLaunchReservationsAdmin,
  useUpdatePreLaunchReservationAdmin,
} from "@/hooks/usePreLaunchReservations";
import { useProducts } from "@/hooks/useProducts";
import type {
  PreLaunchReservation,
  PreLaunchReservationPayload,
  PreLaunchReservationStatus,
} from "@/lib/api";
import { format } from "date-fns";
import { Edit, Loader2, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Filters = {
  product: string;
  region: string;
  status: PreLaunchReservationStatus | "all";
  search: string;
};

type FormState = PreLaunchReservationPayload & {
  status: PreLaunchReservationStatus;
};

const emptyForm: FormState = {
  productId: "",
  productSize: "",
  fullName: "",
  email: "",
  whatsapp: "",
  region: "",
  status: "pending",
};

const statuses: PreLaunchReservationStatus[] = [
  "pending",
  "contacted",
  "completed",
];

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

export default function DashboardPreLaunchReservations() {
  const [filters, setFilters] = useState<Filters>({
    product: "",
    region: "",
    status: "all",
    search: "",
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PreLaunchReservation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [directActionHandled, setDirectActionHandled] = useState(false);

  const confirm = useConfirm();
  const productsQuery = useProducts();
  const query = usePreLaunchReservationsAdmin(filters);
  const createMutation = useCreatePreLaunchReservationAdmin();
  const updateMutation = useUpdatePreLaunchReservationAdmin();
  const deleteMutation = useDeletePreLaunchReservationAdmin();

  const products = productsQuery.data ?? [];
  const reservations = useMemo(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data]
  );

  const selectedProduct = products.find(
    product => String(product.id) === form.productId
  );
  const sizeOptions =
    Array.isArray(selectedProduct?.sizes) && selectedProduct.sizes.length > 0
      ? selectedProduct.sizes.map(String)
      : ["7", "9", "12"];

  const localizeTitle = (title: unknown) => {
    if (!title) return "Rayhana product";
    if (typeof title === "string") return title;
    const localized = title as Record<string, string>;
    return localized.en || Object.values(localized)[0] || "Rayhana product";
  };

  useEffect(() => {
    if (directActionHandled || reservations.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("reservation");
    const action = params.get("action");
    if (!selectedId) return;

    const target = reservations.find(item => item.id === selectedId);
    if (!target) return;

    setDirectActionHandled(true);
    if (action === "delete") {
      void (async () => {
        const ok = await confirm({
          title: "Delete this reservation?",
          description: "This permanently removes the pre-launch reservation.",
          confirmText: "Delete",
          cancelText: "Cancel",
          tone: "danger",
        });
        if (!ok) return;
        deleteMutation.mutate(target.id, {
          onSuccess: () => toast.success("Reservation deleted"),
          onError: () => toast.error("Delete failed"),
        });
      })();
      return;
    }

    openEdit(target);
  }, [confirm, deleteMutation, directActionHandled, reservations]);

  const openCreate = () => {
    const firstProduct = products[0];
    setEditing(null);
    setForm({
      ...emptyForm,
      productId: firstProduct ? String(firstProduct.id) : "",
      productSize: Array.isArray(firstProduct?.sizes)
        ? String(firstProduct.sizes[0] ?? "")
        : "7",
    });
    setOpen(true);
  };

  const openEdit = (reservation: PreLaunchReservation) => {
    setEditing(reservation);
    setForm({
      productId: reservation.productId,
      productSize: reservation.productSize,
      fullName: reservation.fullName,
      email: reservation.email,
      whatsapp: reservation.whatsapp,
      region: reservation.region,
      status: reservation.status,
    });
    setOpen(true);
  };

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (
      !form.productId ||
      !form.productSize ||
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.region.trim()
    ) {
      toast.error("Please complete all required fields");
      return false;
    }
    if (!isValidWhatsapp(normalizeWhatsapp(form.whatsapp))) {
      toast.error("WhatsApp must include a valid country code");
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    const payload = {
      productId: form.productId,
      productSize: form.productSize,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      whatsapp: normalizeWhatsapp(form.whatsapp),
      region: form.region.trim(),
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: { ...payload, status: form.status } },
        {
          onSuccess: () => {
            toast.success("Reservation updated");
            setOpen(false);
          },
          onError: (error: any) =>
            toast.error(error?.response?.data?.error || "Update failed"),
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Reservation created");
        setOpen(false);
      },
      onError: (error: any) =>
        toast.error(error?.response?.data?.error || "Create failed"),
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Pre-launch Reservations
          </h1>
          <p className="text-sm text-muted-foreground">
            Filter, edit, and manage launch discount reservations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isLoading}
            aria-label="Refresh reservations"
            title="Refresh reservations"
          >
            {query.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={openCreate} disabled={products.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="grid gap-1">
          <Label>Product</Label>
          <Select
            value={filters.product || "all"}
            onValueChange={value =>
              setFilters(prev => ({
                ...prev,
                product: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={String(product.id)}>
                  {localizeTitle(product.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>Region</Label>
          <Select
            value={filters.region || "all"}
            onValueChange={value =>
              setFilters(prev => ({
                ...prev,
                region: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={value =>
              setFilters(prev => ({
                ...prev,
                status: value as Filters["status"],
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="reservation-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="reservation-search"
              className="pl-9"
              placeholder="Name, email, WhatsApp"
              value={filters.search}
              onChange={event =>
                setFilters(prev => ({ ...prev, search: event.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="text-sm text-muted-foreground">
          Loading reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No reservations found.
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(reservation => (
            <div
              key={reservation.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">
                      {reservation.fullName}
                    </h3>
                    <Badge variant="outline" className="rounded-md capitalize">
                      {reservation.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.email} · {reservation.whatsapp}
                  </div>
                  <div className="text-sm">
                    {localizeTitle(reservation.product?.title)} · Size{" "}
                    {reservation.productSize} · {reservation.region}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(
                      new Date(reservation.createdAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(reservation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Delete this reservation?",
                        description:
                          "This permanently removes the pre-launch reservation.",
                        confirmText: "Delete",
                        cancelText: "Cancel",
                        tone: "danger",
                      });
                      if (!ok) return;
                      deleteMutation.mutate(reservation.id, {
                        onSuccess: () => toast.success("Reservation deleted"),
                        onError: () => toast.error("Delete failed"),
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {query.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit reservation" : "New reservation"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select
                value={form.productId}
                onValueChange={value => setField("productId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {localizeTitle(product.title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Product size</Label>
              <Select
                value={form.productSize}
                onValueChange={value => setField("productSize", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(size => (
                    <SelectItem key={size} value={size}>
                      Size {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-full-name">Full name</Label>
              <Input
                id="reservation-full-name"
                value={form.fullName}
                onChange={event => setField("fullName", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-email">Email</Label>
              <Input
                id="reservation-email"
                type="email"
                value={form.email}
                onChange={event => setField("email", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reservation-whatsapp">WhatsApp</Label>
              <Input
                id="reservation-whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={event => setField("whatsapp", event.target.value)}
                placeholder="+447700900123"
              />
            </div>

            <div className="grid gap-2">
              <Label>Region</Label>
              <Select
                value={form.region}
                onValueChange={value => setField("region", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editing && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={value =>
                    setField("status", value as PreLaunchReservationStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
