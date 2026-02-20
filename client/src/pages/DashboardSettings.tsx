import { useEffect, useState } from "react";
import { useContent, useUpsertContent } from "@/hooks/useContent";
import { Save, Plus, Trash2, Image as ImageIcon, Eraser } from "lucide-react";
import MediaPicker from "@/components/MediaPicker";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function DashboardSettings() {
  const { data } = useContent("settings");
  const upsert = useUpsertContent("settings");
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const apiPrefix = import.meta.env.VITE_API_URL || "/api";
  const resolveUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const emptyLabel = { en: "", fa: "", ps: "" };
  const normalizeLabel = (label: any) => {
    if (label && typeof label === "object") {
      return {
        en: label.en || "",
        fa: label.fa || "",
        ps: label.ps || "",
      };
    }
    return { ...emptyLabel, en: label || "" };
  };
  const [pickerTarget, setPickerTarget] = useState<"header" | "footer" | null>(null);
  const gaRegex = /^G-[A-Z0-9]{6,12}$/;
  const [gaError, setGaError] = useState<string>("");
  const [clearingCache, setClearingCache] = useState(false);

  const [formData, setFormData] = useState<any>({
    headerLogo: "",
    footerLogo: "",
    gscVerification: "",
    gaMeasurementId: "",
    nav: [{ label: { en: "Home", fa: "", ps: "" }, href: "/" }],
    footerLinks: [{ label: { en: "Privacy Policy", fa: "", ps: "" }, href: "/privacy" }],
    social: [{ label: { en: "Instagram", fa: "", ps: "" }, href: "https://instagram.com" }],
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        headerLogo: data.data.headerLogo || "",
        footerLogo: data.data.footerLogo || "",
        gscVerification: data.data.gscVerification || "",
        gaMeasurementId: data.data.gaMeasurementId || "",
        nav: (data.data.nav || []).map((item: any) => ({
          ...item,
          label: normalizeLabel(item.label),
        })),
        footerLinks: (data.data.footerLinks || []).map((item: any) => ({
          ...item,
          label: normalizeLabel(item.label),
        })),
        social: (data.data.social || []).map((item: any) => ({
          ...item,
          label: normalizeLabel(item.label),
        })),
      });
    }
  }, [data]);

  const updateList = (key: string, next: any[]) => {
    setFormData((prev: any) => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    if (formData.gaMeasurementId && !gaRegex.test(formData.gaMeasurementId)) {
      setGaError("Must match GA4 ID e.g. G-XXXXXXX");
      toast.error("Invalid Google Analytics ID");
      return;
    }

    upsert.mutate(formData, {
      onSuccess: () => {
        toast.success("Settings saved.");
      },
      onError: () => {
        toast.error("Failed to save settings.");
      },
    });
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.post(`${apiPrefix}/dashboard/cache/clear`);
      toast.success("Cache clear instruction sent. Browsers will clear cached assets.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear cache.");
    } finally {
      setClearingCache(false);
    }
  };

  const renderList = (key: "nav" | "footerLinks" | "social", title: string) => (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold">{title}</h2>
        <button
          onClick={() =>
            updateList(key, [
              ...formData[key],
              { label: { ...emptyLabel }, href: "" },
            ])
          }
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {formData[key].map((item: any, idx: number) => (
        <div key={`${key}-${idx}`} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Label (EN)"
            value={item.label?.en || ""}
            onChange={e => {
              const next = [...formData[key]];
              next[idx] = {
                ...next[idx],
                label: { ...normalizeLabel(next[idx].label), en: e.target.value },
              };
              updateList(key, next);
            }}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Label (FA)"
            value={item.label?.fa || ""}
            onChange={e => {
              const next = [...formData[key]];
              next[idx] = {
                ...next[idx],
                label: { ...normalizeLabel(next[idx].label), fa: e.target.value },
              };
              updateList(key, next);
            }}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Label (PS)"
            value={item.label?.ps || ""}
            onChange={e => {
              const next = [...formData[key]];
              next[idx] = {
                ...next[idx],
                label: { ...normalizeLabel(next[idx].label), ps: e.target.value },
              };
              updateList(key, next);
            }}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Href"
            value={item.href}
            onChange={e => {
              const next = [...formData[key]];
              next[idx] = { ...next[idx], href: e.target.value };
              updateList(key, next);
            }}
          />
          <button
            onClick={() => {
              const next = formData[key].filter((_: any, i: number) => i !== idx);
              updateList(key, next);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage navigation, footer links, and social profiles.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
          disabled={upsert.isPending}
        >
          <Save className="w-4 h-4" />
          {upsert.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-card border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Branding</h2>
          <p className="text-sm text-muted-foreground">Header & footer logos</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {["header", "footer"].map(slot => {
            const key = slot === "header" ? "headerLogo" : "footerLogo";
            const label = slot === "header" ? "Header logo" : "Footer logo";
            const url = formData[key];
            return (
              <div key={slot} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="w-full h-20 rounded-lg border bg-muted/40 flex items-center justify-center overflow-hidden">
                  {url ? (
                    <img loading="lazy"
                      src={resolveUrl(url)}
                      alt={`${label} preview`}
                      className="max-h-20 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No logo set</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTarget(slot as "header" | "footer")}
                    className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
                  >
                    Choose from library
                  </button>
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="/uploads/logo.svg or https://..."
                    value={url || ""}
                    onChange={e =>
                      setFormData((prev: any) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-card border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">SEO & Analytics</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Google Search Console token</label>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="paste verification token"
              value={formData.gscVerification || ""}
              onChange={e => setFormData((prev: any) => ({ ...prev, gscVerification: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">If empty, the verification meta tag will not be rendered.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Google Analytics Measurement ID</label>
            <input
              className={`border rounded-lg px-3 py-2 w-full ${gaError ? "border-red-500 focus:ring-red-500" : ""}`}
              placeholder="G-XXXXXXXXXX"
              pattern="^G-[A-Z0-9]{6,12}$"
              value={formData.gaMeasurementId || ""}
              onChange={e => {
                const val = e.target.value;
                setFormData((prev: any) => ({ ...prev, gaMeasurementId: val }));
                setGaError(val && !gaRegex.test(val) ? "Must match GA4 ID e.g. G-XXXXXXX" : "");
              }}
            />
            <p className={`text-xs ${gaError ? "text-red-600" : "text-muted-foreground"}`}>
              {gaError || "If empty, GA script will not be injected."}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold">Cache</h2>
            <p className="text-sm text-muted-foreground">
              Sends Clear-Site-Data: cache. It only clears the browser cache of the admin making this request and only for the API origin. If your API origin differs from the frontend (VITE_API_URL ≠ &quot;/api&quot;), only that origin is cleared; same-origin setups behave as expected. CDN/edge caches are not purged.
            </p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm"
          >
            <Eraser className="w-4 h-4" />
            {clearingCache ? "Clearing..." : "Clear cache"}
          </button>
        </div>
      </div>
      {renderList("nav", "Navigation")}
      {renderList("footerLinks", "Footer Links")}
      {renderList("social", "Social Links")}
      <MediaPicker
        open={pickerTarget !== null}
        accept="image"
        onClose={() => setPickerTarget(null)}
        onSelect={url => {
          if (!pickerTarget) return;
          setFormData((prev: any) => ({ ...prev, [pickerTarget + "Logo"]: url }));
          setPickerTarget(null);
        }}
      />
    </div>
  );
}
