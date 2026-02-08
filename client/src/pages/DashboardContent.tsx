import { useEffect, useMemo, useState } from "react";
import { useContent, useUpsertContent } from "@/hooks/useContent";
import MediaPicker from "@/components/MediaPicker";
import { Save, Trash2 } from "lucide-react";
import BlogRichTextEditor from "@/components/BlogRichTextEditor";
import { toast } from "sonner";
import {
  contentSchemas,
  type Field,
  type Lang,
} from "@/content/contentSchemas";

const fallbackHome = {
  hero: {
    title: { en: "", fa: "", ps: "" },
    subtitle: { en: "", fa: "", ps: "" },
    cta: { en: "", fa: "", ps: "" },
  },
  images: {
    heroVideo: "",
    featuredProduct: "",
    storyImage: "",
  },
  featuredProduct: {
    title: { en: "", fa: "", ps: "" },
    description: { en: "", fa: "", ps: "" },
    bullets: [
      { text: { en: "", fa: "", ps: "" } },
      { text: { en: "", fa: "", ps: "" } },
      { text: { en: "", fa: "", ps: "" } },
      { text: { en: "", fa: "", ps: "" } },
    ],
  },
  story: {
    title: { en: "", fa: "", ps: "" },
    body: { en: "", fa: "", ps: "" },
    cta: { en: "", fa: "", ps: "" },
  },
  values: [
    { title: "", body: "", icon: "star" },
    { title: "", body: "", icon: "shield" },
    { title: "", body: "", icon: "globe" },
  ],
};

const fallbackAbout = {
  hero: {
    title: { en: "", fa: "", ps: "" },
    subtitle: { en: "", fa: "", ps: "" },
  },
  images: {
    story: "",
  },
  story: {
    title: { en: "", fa: "", ps: "" },
    body: { en: "", fa: "", ps: "" },
  },
  mission: {
    title: { en: "", fa: "", ps: "" },
    body: { en: "", fa: "", ps: "" },
  },
  founder: {
    title: { en: "", fa: "", ps: "" },
    body: { en: "", fa: "", ps: "" },
  },
};

const fallbackFaq = {
  title: { en: "", fa: "", ps: "" },
  subtitle: { en: "", fa: "", ps: "" },
  items: [
    {
      id: "q1",
      question: { en: "", fa: "", ps: "" },
      answer: { en: "", fa: "", ps: "" },
    },
    {
      id: "q2",
      question: { en: "", fa: "", ps: "" },
      answer: { en: "", fa: "", ps: "" },
    },
  ],
};

const fallbackTerms = {
  effectiveDate: "",
  title: { en: "", fa: "", ps: "" },
  intro: { en: "", fa: "", ps: "" },
  sections: [
    { title: { en: "", fa: "", ps: "" }, body: { en: "", fa: "", ps: "" } },
  ],
};

const fallbackPrivacy = {
  effectiveDate: "",
  title: { en: "", fa: "", ps: "" },
  intro: { en: "", fa: "", ps: "" },
  sections: [
    { title: { en: "", fa: "", ps: "" }, body: { en: "", fa: "", ps: "" } },
  ],
};

const fallbackHelp = {
  center: {
    title: { en: "", fa: "", ps: "" },
    subtitle: { en: "", fa: "", ps: "" },
    contactEmail: "",
    sections: [
      {
        slug: "",
        title: { en: "", fa: "", ps: "" },
        description: { en: "", fa: "", ps: "" },
        icon: "lifeBuoy",
      },
    ],
    faqs: [
      {
        question: { en: "", fa: "", ps: "" },
        answer: { en: "", fa: "", ps: "" },
      },
    ],
  },
  articles: [
    {
      slug: "",
      title: { en: "", fa: "", ps: "" },
      updated: "",
      intro: { en: "", fa: "", ps: "" },
      steps: { en: "", fa: "", ps: "" },
      tips: { en: "", fa: "", ps: "" },
    },
  ],
};

const CONTENT_KEYS = ["home", "about", "faq", "terms", "privacy", "help"] as const;

export default function DashboardContent() {
  const [key, setKey] = useState<(typeof CONTENT_KEYS)[number]>("home");
  const { data, isLoading } = useContent(key);
  const upsert = useUpsertContent(key);
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaAccept, setMediaAccept] = useState<"image" | "video" | "both">(
    "image"
  );
  const [imageTarget, setImageTarget] = useState<{
    path: string[];
  } | null>(null);

  const initialData = useMemo(() => {
    if (key === "home") return fallbackHome;
    if (key === "about") return fallbackAbout;
    if (key === "faq") return fallbackFaq;
    if (key === "terms") return fallbackTerms;
    if (key === "privacy") return fallbackPrivacy;
    return fallbackHelp;
  }, [key]);

  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (data?.data) {
      const nextData = { ...initialData, ...data.data };
      if (key === "home" && Array.isArray(nextData.values)) {
        nextData.values = nextData.values.map((item: any) => ({
          ...item,
          title:
            item.title && typeof item.title === "object"
              ? {
                  en: item.title.en || "",
                  fa: item.title.fa || "",
                  ps: item.title.ps || "",
                }
              : { en: item.title || "", fa: "", ps: "" },
          body:
            item.body && typeof item.body === "object"
              ? {
                  en: item.body.en || "",
                  fa: item.body.fa || "",
                  ps: item.body.ps || "",
                }
              : { en: item.body || "", fa: "", ps: "" },
        }));
      }
      if (key === "home" && Array.isArray(nextData.featuredProduct?.bullets)) {
        nextData.featuredProduct.bullets = nextData.featuredProduct.bullets.map(
          (item: any) => {
            if (item && typeof item === "object" && "text" in item) {
              const text = (item as any).text;
              return {
                ...item,
                text:
                  text && typeof text === "object"
                    ? {
                        en: text.en || "",
                        fa: text.fa || "",
                        ps: text.ps || "",
                      }
                    : { en: text || "", fa: "", ps: "" },
              };
            }
            return {
              text:
                item && typeof item === "object"
                  ? {
                      en: item.en || "",
                      fa: item.fa || "",
                      ps: item.ps || "",
                    }
                  : { en: item || "", fa: "", ps: "" },
            };
          }
        );
      }
      setFormData(nextData);
    } else {
      setFormData(initialData);
    }
  }, [data, initialData, key]);

  const setDeep = (obj: any, path: string[], value: any) => {
    const clone = structuredClone(obj);
    let node = clone;
    for (let i = 0; i < path.length - 1; i++) {
      node[path[i]] = node[path[i]] ?? {};
      node = node[path[i]];
    }
    node[path[path.length - 1]] = value;
    return clone;
  };

  const getDeep = (obj: any, path: string[]) =>
    path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

  const updateField = (path: string[], value: any) => {
    setFormData((prev: any) => setDeep(prev, path, value));
  };

  const updateLangField = (path: string[], value: string) => {
    setFormData((prev: any) => setDeep(prev, [...path, activeLang], value));
  };

  const openMediaPicker = (path: string[]) => {
    setImageTarget({ path });
    setShowMediaPicker(true);
  };

  const handleSave = () => {
    upsert.mutate(formData, {
      onSuccess: () => {
        toast.success(`Saved ${key} content.`);
      },
      onError: () => {
        toast.error(`Failed to save ${key} content.`);
      },
    });
  };

  const renderTextInput = (
    field: Field,
    value: string,
    onChange: (value: string) => void
  ) => (
    <input
      className="border rounded-lg px-3 py-2 w-full"
      placeholder={field.label}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );

  const renderField = (field: Field) => {
    if (field.type === "text") {
      const value = field.localized
        ? getDeep(formData, [...field.path, activeLang]) || ""
        : getDeep(formData, field.path) || "";
      return renderTextInput(field, value, nextValue => {
        if (field.localized) {
          updateLangField(field.path, nextValue);
        } else {
          updateField(field.path, nextValue);
        }
      });
    }

    if (field.type === "richtext") {
      const value = field.localized
        ? getDeep(formData, [...field.path, activeLang]) || ""
        : getDeep(formData, field.path) || "";
      return (
        <BlogRichTextEditor
          value={value}
          onChange={nextValue => {
            if (field.localized) {
              updateLangField(field.path, nextValue);
            } else {
              updateField(field.path, nextValue);
            }
          }}
          placeholder={field.label}
        />
      );
    }

    if (field.type === "media") {
      const value = getDeep(formData, field.path) || "";
      return (
        <div className="flex items-center gap-2">
          <input
            className="border rounded-lg px-3 py-2 w-full"
            placeholder={field.label}
            value={value}
            onChange={e => updateField(field.path, e.target.value)}
          />
          <button
            type="button"
            className="p-2 border rounded-lg"
            onClick={() => {
              setMediaAccept(field.accept);
              openMediaPicker(field.path);
            }}
          >
            Select
          </button>
        </div>
      );
    }

    if (field.type === "select") {
      const value = getDeep(formData, field.path) || field.options[0]?.value;
      return (
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={value}
          onChange={e => updateField(field.path, e.target.value)}
        >
          {field.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "string-list") {
      const items: string[] = getDeep(formData, field.path) || [];
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, idx) => (
            <div key={`${field.label}-${idx}`} className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-2 w-full"
                placeholder={`${field.label} ${idx + 1}`}
                value={item}
                onChange={e => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  updateField(field.path, next);
                }}
              />
              <button
                type="button"
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx);
                  updateField(field.path, next);
                }}
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!field.maxItems || items.length < field.maxItems) && (
            <button
              type="button"
              className="text-sm text-primary hover:underline text-left"
              onClick={() => {
                updateField(field.path, [...items, ""]);
              }}
            >
              + Add item
            </button>
          )}
        </div>
      );
    }

    if (field.type === "object-list") {
      const items: any[] = getDeep(formData, field.path) || [];
      return (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={`${field.label}-${index}`} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {field.itemLabel(index)}
                </h3>
                <button
                  type="button"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== index);
                    updateField(field.path, next);
                  }}
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {field.fields.map(itemField => {
                  const itemPath = [...field.path, index, ...itemField.path];
                  if (itemField.type === "text") {
                    const value = itemField.localized
                      ? getDeep(formData, [...itemPath, activeLang]) || ""
                      : getDeep(formData, itemPath) || "";
                    return (
                      <div key={itemField.label}>
                        <label className="text-xs text-gray-500">
                          {itemField.label}
                        </label>
                        {renderTextInput(itemField, value, nextValue => {
                          if (itemField.localized) {
                            updateLangField(itemPath, nextValue);
                          } else {
                            updateField(itemPath, nextValue);
                          }
                        })}
                      </div>
                    );
                  }

                  if (itemField.type === "richtext") {
                    const value = itemField.localized
                      ? getDeep(formData, [...itemPath, activeLang]) || ""
                      : getDeep(formData, itemPath) || "";
                    return (
                      <div key={itemField.label}>
                        <label className="text-xs text-gray-500">
                          {itemField.label}
                        </label>
                        <BlogRichTextEditor
                          value={value}
                          onChange={nextValue => {
                            if (itemField.localized) {
                              updateLangField(itemPath, nextValue);
                            } else {
                              updateField(itemPath, nextValue);
                            }
                          }}
                          placeholder={itemField.label}
                        />
                      </div>
                    );
                  }

                  if (itemField.type === "select") {
                    const value =
                      getDeep(formData, itemPath) || itemField.options[0]?.value;
                    return (
                      <div key={itemField.label}>
                        <label className="text-xs text-gray-500">
                          {itemField.label}
                        </label>
                        <select
                          className="border rounded-lg px-3 py-2 w-full"
                          value={value}
                          onChange={e => updateField(itemPath, e.target.value)}
                        >
                          {itemField.options.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => {
              const nextItem = structuredClone(field.itemDefaults);
              if ("id" in nextItem && !nextItem.id) {
                nextItem.id = `item-${items.length + 1}`;
              }
              updateField(field.path, [...items, nextItem]);
            }}
          >
            + Add {field.label}
          </button>
        </div>
      );
    }

    return null;
  };

  const schema = contentSchemas[key];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Site Content
          </h1>
          <p className="text-sm text-gray-500">
            Edit dynamic content for Home, About, and FAQ.
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

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Content Key</label>
          <select
            value={key}
            onChange={e =>
              setKey(e.target.value as (typeof CONTENT_KEYS)[number])
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {CONTENT_KEYS.map(contentKey => (
              <option key={contentKey} value={contentKey}>
                {contentKey}
              </option>
            ))}
          </select>

          <div className="ml-auto flex gap-2">
            {(["en", "fa", "ps"] as Lang[]).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeLang === lang
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500">Loading content...</div>
      )}

      {schema.sections.map(section => (
        <div key={section.title} className="bg-white border rounded-xl p-4 space-y-4">
          <h2 className="font-serif text-xl font-bold">{section.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {section.fields
              .filter(field => field.type !== "object-list" && field.type !== "string-list")
              .map(field => (
                <div key={field.label} className="space-y-2">
                  <label className="text-xs text-gray-500">{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
          </div>
          {section.fields
            .filter(field => field.type === "object-list" || field.type === "string-list")
            .map(field => (
              <div key={field.label} className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">{field.label}</h3>
                {renderField(field)}
              </div>
            ))}
        </div>
      ))}

      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={url => {
          if (imageTarget) {
            updateField(imageTarget.path, url);
          }
          setShowMediaPicker(false);
        }}
        accept={mediaAccept}
      />
    </div>
  );
}
