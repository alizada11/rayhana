import { useEffect, useState } from "react";
import { useContent, useUpsertContent } from "@/hooks/useContent";
import { Save, Plus, Trash2 } from "lucide-react";

export default function DashboardSettings() {
  const { data } = useContent("settings");
  const upsert = useUpsertContent("settings");
  const [formData, setFormData] = useState<any>({
    nav: [{ label: "Home", href: "/" }],
    footerLinks: [{ label: "Privacy Policy", href: "/privacy" }],
    social: [{ label: "Instagram", href: "https://instagram.com" }],
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        nav: data.data.nav || [],
        footerLinks: data.data.footerLinks || [],
        social: data.data.social || [],
      });
    }
  }, [data]);

  const updateList = (key: string, next: any[]) => {
    setFormData((prev: any) => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    upsert.mutate(formData);
  };

  const renderList = (key: "nav" | "footerLinks" | "social", title: string) => (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold">{title}</h2>
        <button
          onClick={() =>
            updateList(key, [...formData[key], { label: "", href: "" }])
          }
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {formData[key].map((item: any, idx: number) => (
        <div key={`${key}-${idx}`} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Label"
            value={item.label}
            onChange={e => {
              const next = [...formData[key]];
              next[idx] = { ...next[idx], label: e.target.value };
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
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-sm text-gray-500">
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

      {renderList("nav", "Navigation")}
      {renderList("footerLinks", "Footer Links")}
      {renderList("social", "Social Links")}
    </div>
  );
}
