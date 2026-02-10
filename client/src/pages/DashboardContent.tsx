import { useEffect, useMemo, useState } from "react";
import { useContent, useUpsertContent } from "@/hooks/useContent";
import MediaPicker from "@/components/MediaPicker";
import { Image as ImageIcon, Save } from "lucide-react";
import BlogRichTextEditor from "@/components/BlogRichTextEditor";
import { toast } from "sonner";

type Lang = "en" | "fa" | "ps";

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
    bullets: ["", "", "", ""],
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
  quote: {
    text: { en: "", fa: "", ps: "" },
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

const fallbackContact = {
  hero: {
    title: { en: "", fa: "", ps: "" },
    subtitle: { en: "", fa: "", ps: "" },
  },
  info: [
    {
      icon: "mapPin",
      title: { en: "", fa: "", ps: "" },
      value: { en: "", fa: "", ps: "" },
    },
    {
      icon: "phone",
      title: { en: "", fa: "", ps: "" },
      value: { en: "", fa: "", ps: "" },
    },
    {
      icon: "mail",
      title: { en: "", fa: "", ps: "" },
      value: { en: "", fa: "", ps: "" },
    },
  ],
  form: {
    nameLabel: { en: "", fa: "", ps: "" },
    emailLabel: { en: "", fa: "", ps: "" },
    subjectLabel: { en: "", fa: "", ps: "" },
    messageLabel: { en: "", fa: "", ps: "" },
    submitLabel: { en: "", fa: "", ps: "" },
    successMessage: { en: "", fa: "", ps: "" },
    errorMessage: { en: "", fa: "", ps: "" },
  },
};

const CONTENT_KEYS = [
  "home",
  "about",
  "faq",
  "terms",
  "privacy",
  "help",
  "contact",
] as const;

export default function DashboardContent() {
  const [key, setKey] = useState<string>("home");
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
    if (key === "contact") return fallbackContact;
    return fallbackHelp;
  }, [key]);

  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    const nextData = { ...initialData, ...(data?.data || {}) };

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

    // Normalize about.quote shape
    if (key === "about") {
      if (!nextData.quote || typeof nextData.quote !== "object") {
        const quoteString =
          typeof nextData.quote === "string" ? nextData.quote : "";
        nextData.quote = { text: { en: quoteString, fa: "", ps: "" } };
      }

      if (!nextData.quote.text || typeof nextData.quote.text !== "object") {
        nextData.quote.text = {
          en:
            typeof nextData.quote.text === "string" ? nextData.quote.text : "",
          fa: "",
          ps: "",
        };
      } else {
        nextData.quote.text = {
          en: nextData.quote.text.en || "",
          fa: nextData.quote.text.fa || "",
          ps: nextData.quote.text.ps || "",
        };
      }
    }

    if (key === "contact") {
      nextData.hero = nextData.hero || { title: {}, subtitle: {} };
      nextData.hero.title = {
        en: nextData.hero.title?.en || "",
        fa: nextData.hero.title?.fa || "",
        ps: nextData.hero.title?.ps || "",
      };
      nextData.hero.subtitle = {
        en: nextData.hero.subtitle?.en || "",
        fa: nextData.hero.subtitle?.fa || "",
        ps: nextData.hero.subtitle?.ps || "",
      };

      nextData.info = Array.isArray(nextData.info) ? nextData.info : [];
      nextData.info = nextData.info.map((item: any) => ({
        icon: item?.icon || "mapPin",
        title:
          item?.title && typeof item.title === "object"
            ? {
                en: item.title.en || "",
                fa: item.title.fa || "",
                ps: item.title.ps || "",
              }
            : { en: item?.title || "", fa: "", ps: "" },
        value:
          item?.value && typeof item.value === "object"
            ? {
                en: item.value.en || "",
                fa: item.value.fa || "",
                ps: item.value.ps || "",
              }
            : { en: item?.value || "", fa: "", ps: "" },
      }));

      nextData.form = nextData.form || {};
      const formKeys = [
        "nameLabel",
        "emailLabel",
        "subjectLabel",
        "messageLabel",
        "submitLabel",
        "successMessage",
        "errorMessage",
      ];
      formKeys.forEach(keyName => {
        const val = (nextData.form as any)[keyName];
        (nextData.form as any)[keyName] =
          val && typeof val === "object"
            ? { en: val.en || "", fa: val.fa || "", ps: val.ps || "" }
            : { en: val || "", fa: "", ps: "" };
      });
    }

    setFormData(nextData);
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

  const updateLangField = (path: string[], value: string) => {
    setFormData((prev: any) => setDeep(prev, [...path, activeLang], value));
  };

  const updateField = (path: string[], value: any) => {
    setFormData((prev: any) => setDeep(prev, path, value));
  };

  const openMediaPicker = (path: string[]) => {
    setImageTarget({ path });
    setShowMediaPicker(true);
  };

  const openHeroMediaPicker = () => {
    setImageTarget({ path: ["images", "heroVideo"] });
    setMediaAccept("both");
    setShowMediaPicker(true);
  };

  const openImagePicker = (path: string[]) => {
    setImageTarget({ path });
    setMediaAccept("image");
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

      {/* Home Editor */}
      {key === "home" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Hero</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Hero title"
                value={formData.hero?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "title"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Hero subtitle"
                value={formData.hero?.subtitle?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "subtitle"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Hero CTA"
                value={formData.hero?.cta?.[activeLang] || ""}
                onChange={e => updateLangField(["hero", "cta"], e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Hero media URL (video or image)"
                  value={formData.images?.heroVideo || ""}
                  onChange={e =>
                    updateField(["images", "heroVideo"], e.target.value)
                  }
                />
                <button
                  type="button"
                  className="p-2 border rounded-lg"
                  onClick={openHeroMediaPicker}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Featured Product</h2>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={formData.featuredProduct?.title?.[activeLang] || ""}
                  onChange={e =>
                    updateLangField(
                      ["featuredProduct", "title"],
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <BlogRichTextEditor
                  value={
                    formData.featuredProduct?.description?.[activeLang] || ""
                  }
                  onChange={value =>
                    updateLangField(["featuredProduct", "description"], value)
                  }
                  placeholder="Description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Image URL"
                  value={formData.images?.featuredProduct || ""}
                  onChange={e =>
                    updateField(["images", "featuredProduct"], e.target.value)
                  }
                />
                <button
                  type="button"
                  className="p-2 border rounded-lg"
                  onClick={() => openImagePicker(["images", "featuredProduct"])}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {formData.featuredProduct?.bullets?.map(
                (item: any, idx: number) => (
                  <input
                    key={idx}
                    className="border rounded-lg px-3 py-2"
                    placeholder={`Bullet ${idx + 1}`}
                    value={item?.text?.[activeLang] || ""}
                    onChange={e => {
                      const next = [...formData.featuredProduct.bullets];
                      const current = next[idx] || {};
                      const text =
                        current.text && typeof current.text === "object"
                          ? { ...current.text }
                          : { en: "", fa: "", ps: "" };
                      next[idx] = {
                        ...current,
                        text: { ...text, [activeLang]: e.target.value },
                      };
                      updateField(["featuredProduct", "bullets"], next);
                    }}
                  />
                )
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Story</h2>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">title</label>
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={formData.story?.title?.[activeLang] || ""}
                  onChange={e =>
                    updateLangField(["story", "title"], e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Body</label>
                <BlogRichTextEditor
                  value={formData.story?.body?.[activeLang] || ""}
                  onChange={value => updateLangField(["story", "body"], value)}
                  placeholder="Story body"
                />
              </div>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="CTA"
                value={formData.story?.cta?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["story", "cta"], e.target.value)
                }
              />
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Story image URL"
                  value={formData.images?.storyImage || ""}
                  onChange={e =>
                    updateField(["images", "storyImage"], e.target.value)
                  }
                />
                <button
                  type="button"
                  className="p-2 border rounded-lg"
                  onClick={() => openImagePicker(["images", "storyImage"])}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Values Cards</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {formData.values?.map((item: any, idx: number) => (
                <div key={`value-${idx}`} className="space-y-3">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder={`Title ${idx + 1}`}
                    value={item?.title?.[activeLang] || ""}
                    onChange={e => {
                      const next = structuredClone(formData.values);
                      const current = next[idx] || {};
                      const title =
                        current.title && typeof current.title === "object"
                          ? { ...current.title }
                          : { en: "", fa: "", ps: "" };
                      next[idx] = {
                        ...current,
                        title: { ...title, [activeLang]: e.target.value },
                      };
                      updateField(["values"], next);
                    }}
                  />
                  <div>
                    <label className="text-xs text-gray-500">Body</label>
                    <BlogRichTextEditor
                      value={item?.body?.[activeLang] || ""}
                      onChange={value => {
                        const next = structuredClone(formData.values);
                        const current = next[idx] || {};
                        const body =
                          current.body && typeof current.body === "object"
                            ? { ...current.body }
                            : { en: "", fa: "", ps: "" };
                        next[idx] = {
                          ...current,
                          body: { ...body, [activeLang]: value },
                        };
                        updateField(["values"], next);
                      }}
                      placeholder={`Body ${idx + 1}`}
                    />
                  </div>

                  <select
                    className="border rounded-lg px-3 py-2 w-full"
                    value={item.icon || "star"}
                    onChange={e => {
                      const next = structuredClone(formData.values);
                      next[idx] = { ...next[idx], icon: e.target.value };
                      updateField(["values"], next);
                    }}
                  >
                    <option value="star">Star</option>
                    <option value="shield">Shield</option>
                    <option value="globe">Globe</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Editor */}
      {(key as string) === "about" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Hero</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.hero?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "title"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Subtitle"
                value={formData.hero?.subtitle?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "subtitle"], e.target.value)
                }
              />
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Story</h2>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={formData.story?.title?.[activeLang] || ""}
                  onChange={e =>
                    updateLangField(["story", "title"], e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Body</label>
                <BlogRichTextEditor
                  value={formData.story?.body?.[activeLang] || ""}
                  onChange={value => updateLangField(["story", "body"], value)}
                  placeholder="Story body"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Story image URL"
                  value={formData.images?.story || ""}
                  onChange={e =>
                    updateField(["images", "story"], e.target.value)
                  }
                />
                <button
                  type="button"
                  className="p-2 border rounded-lg"
                  onClick={() => openImagePicker(["images", "story"])}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 space-y-4 ">
            <h2 className="font-serif text-xl font-bold">Mission</h2>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={formData.mission?.title?.[activeLang] || ""}
                  onChange={e =>
                    updateLangField(["mission", "title"], e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Body</label>
                <BlogRichTextEditor
                  value={formData.mission?.body?.[activeLang] || ""}
                  onChange={value =>
                    updateLangField(["mission", "body"], value)
                  }
                  placeholder="Mission body"
                />
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Founder</h2>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={formData.founder?.title?.[activeLang] || ""}
                  onChange={e =>
                    updateLangField(["founder", "title"], e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Body</label>
                <BlogRichTextEditor
                  value={formData.founder?.body?.[activeLang] || ""}
                  onChange={value =>
                    updateLangField(["founder", "body"], value)
                  }
                  placeholder="Founder body"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-3">
            <h2 className="font-serif text-xl font-bold">Quote</h2>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Quote text"
              value={formData.quote?.text?.[activeLang] || ""}
              onChange={e => updateLangField(["quote", "text"], e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Appears in the founder section; HTML is stripped on render.
            </p>
          </div>
        </div>
      )}

      {/* FAQ Editor */}
      {key === "faq" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">FAQ</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.title?.[activeLang] || ""}
                onChange={e => updateLangField(["title"], e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Subtitle"
                value={formData.subtitle?.[activeLang] || ""}
                onChange={e => updateLangField(["subtitle"], e.target.value)}
              />
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Questions</h2>
            {formData.items?.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="grid md:grid-cols-1 gap-4 items-start"
              >
                <div className="flex flex-col py-2">
                  <label className="text-xs text-gray-500">Question</label>
                  <input
                    className="border rounded-lg mt-1 px-3 py-2"
                    placeholder={`Question ${idx + 1}`}
                    value={item.question?.[activeLang] || ""}
                    onChange={e => {
                      const next = structuredClone(formData.items);
                      next[idx].question = {
                        ...(next[idx].question || {}),
                        [activeLang]: e.target.value,
                      };
                      updateField(["items"], next);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Answer</label>
                  <BlogRichTextEditor
                    value={item.answer?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.items);
                      next[idx].answer = {
                        ...(next[idx].answer || {}),
                        [activeLang]: value,
                      };
                      updateField(["items"], next);
                    }}
                    placeholder={`Answer ${idx + 1}`}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const next = [
                  ...formData.items,
                  {
                    id: `q${formData.items.length + 1}`,
                    question: { en: "", fa: "", ps: "" },
                    answer: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["items"], next);
              }}
              className="text-sm text-primary hover:underline"
            >
              + Add Question
            </button>
          </div>
        </div>
      )}

      {/* Terms Editor */}
      {key === "terms" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Terms Page</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Effective Date"
                value={formData.effectiveDate || ""}
                onChange={e => updateField(["effectiveDate"], e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.title?.[activeLang] || ""}
                onChange={e => updateLangField(["title"], e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Intro</label>
                <BlogRichTextEditor
                  value={formData.intro?.[activeLang] || ""}
                  onChange={value => updateLangField(["intro"], value)}
                  placeholder="Intro"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Sections</h2>
            {formData.sections?.map((section: any, idx: number) => (
              <div
                key={`terms-section-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">
                    Section {idx + 1}
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.sections);
                      next.splice(idx, 1);
                      updateField(["sections"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Title"
                  value={section.title?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.sections);
                    next[idx] = {
                      ...next[idx],
                      title: {
                        ...next[idx].title,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["sections"], next);
                  }}
                />
                <div>
                  <label className="text-xs text-gray-500">Body</label>
                  <BlogRichTextEditor
                    value={section.body?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.sections);
                      next[idx] = {
                        ...next[idx],
                        body: { ...next[idx].body, [activeLang]: value },
                      };
                      updateField(["sections"], next);
                    }}
                    placeholder="Body"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.sections || []),
                  {
                    title: { en: "", fa: "", ps: "" },
                    body: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["sections"], next);
              }}
            >
              + Add Section
            </button>
          </div>
        </div>
      )}

      {/* Privacy Editor */}
      {key === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Privacy Policy</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Effective Date"
                value={formData.effectiveDate || ""}
                onChange={e => updateField(["effectiveDate"], e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.title?.[activeLang] || ""}
                onChange={e => updateLangField(["title"], e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Intro</label>
                <BlogRichTextEditor
                  value={formData.intro?.[activeLang] || ""}
                  onChange={value => updateLangField(["intro"], value)}
                  placeholder="Intro"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Sections</h2>
            {formData.sections?.map((section: any, idx: number) => (
              <div
                key={`privacy-section-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">
                    Section {idx + 1}
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.sections);
                      next.splice(idx, 1);
                      updateField(["sections"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Title"
                  value={section.title?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.sections);
                    next[idx] = {
                      ...next[idx],
                      title: {
                        ...next[idx].title,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["sections"], next);
                  }}
                />
                <div>
                  <label className="text-xs text-gray-500">Body</label>
                  <BlogRichTextEditor
                    value={section.body?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.sections);
                      next[idx] = {
                        ...next[idx],
                        body: { ...next[idx].body, [activeLang]: value },
                      };
                      updateField(["sections"], next);
                    }}
                    placeholder="Body"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.sections || []),
                  {
                    title: { en: "", fa: "", ps: "" },
                    body: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["sections"], next);
              }}
            >
              + Add Section
            </button>
          </div>
        </div>
      )}

      {/* Help Editor */}
      {key === "help" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Help Center</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.center?.title?.[activeLang] || ""}
                onChange={e =>
                  updateField(["center", "title"], {
                    ...formData.center?.title,
                    [activeLang]: e.target.value,
                  })
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Subtitle"
                value={formData.center?.subtitle?.[activeLang] || ""}
                onChange={e =>
                  updateField(["center", "subtitle"], {
                    ...formData.center?.subtitle,
                    [activeLang]: e.target.value,
                  })
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Contact Email"
                value={formData.center?.contactEmail || ""}
                onChange={e =>
                  updateField(["center", "contactEmail"], e.target.value)
                }
              />
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Help Sections</h2>
            {formData.center?.sections?.map((section: any, idx: number) => (
              <div
                key={`help-section-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">
                    Section {idx + 1}
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.center.sections);
                      next.splice(idx, 1);
                      updateField(["center", "sections"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Slug"
                  value={section.slug || ""}
                  onChange={e => {
                    const next = structuredClone(formData.center.sections);
                    next[idx] = { ...next[idx], slug: e.target.value };
                    updateField(["center", "sections"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Title"
                  value={section.title?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.center.sections);
                    next[idx] = {
                      ...next[idx],
                      title: {
                        ...next[idx].title,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["center", "sections"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Description"
                  value={section.description?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.center.sections);
                    next[idx] = {
                      ...next[idx],
                      description: {
                        ...next[idx].description,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["center", "sections"], next);
                  }}
                />
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={section.icon || "lifeBuoy"}
                  onChange={e => {
                    const next = structuredClone(formData.center.sections);
                    next[idx] = { ...next[idx], icon: e.target.value };
                    updateField(["center", "sections"], next);
                  }}
                >
                  <option value="lifeBuoy">Life Buoy</option>
                  <option value="package">Package</option>
                  <option value="refresh">Refresh</option>
                  <option value="shield">Shield</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.center?.sections || []),
                  {
                    slug: "",
                    title: { en: "", fa: "", ps: "" },
                    description: { en: "", fa: "", ps: "" },
                    icon: "lifeBuoy",
                  },
                ];
                updateField(["center", "sections"], next);
              }}
            >
              + Add Help Section
            </button>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">FAQs</h2>
            {formData.center?.faqs?.map((faq: any, idx: number) => (
              <div
                key={`faq-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">FAQ {idx + 1}</h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.center.faqs);
                      next.splice(idx, 1);
                      updateField(["center", "faqs"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Question"
                  value={faq.question?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.center.faqs);
                    next[idx] = {
                      ...next[idx],
                      question: {
                        ...next[idx].question,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["center", "faqs"], next);
                  }}
                />
                <div>
                  <label className="text-xs text-gray-500">Answer</label>
                  <BlogRichTextEditor
                    value={faq.answer?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.center.faqs);
                      next[idx] = {
                        ...next[idx],
                        answer: { ...next[idx].answer, [activeLang]: value },
                      };
                      updateField(["center", "faqs"], next);
                    }}
                    placeholder="Answer"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.center?.faqs || []),
                  {
                    question: { en: "", fa: "", ps: "" },
                    answer: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["center", "faqs"], next);
              }}
            >
              + Add FAQ
            </button>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Help Articles</h2>
            {formData.articles?.map((article: any, idx: number) => (
              <div
                key={`article-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">
                    Article {idx + 1}
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.articles);
                      next.splice(idx, 1);
                      updateField(["articles"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Slug"
                  value={article.slug || ""}
                  onChange={e => {
                    const next = structuredClone(formData.articles);
                    next[idx] = { ...next[idx], slug: e.target.value };
                    updateField(["articles"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Title"
                  value={article.title?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.articles);
                    next[idx] = {
                      ...next[idx],
                      title: {
                        ...next[idx].title,
                        [activeLang]: e.target.value,
                      },
                    };
                    updateField(["articles"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Last Updated"
                  value={article.updated || ""}
                  onChange={e => {
                    const next = structuredClone(formData.articles);
                    next[idx] = { ...next[idx], updated: e.target.value };
                    updateField(["articles"], next);
                  }}
                />
                <div>
                  <label className="text-xs text-gray-500">Intro</label>
                  <BlogRichTextEditor
                    value={article.intro?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.articles);
                      next[idx] = {
                        ...next[idx],
                        intro: { ...next[idx].intro, [activeLang]: value },
                      };
                      updateField(["articles"], next);
                    }}
                    placeholder="Intro"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Steps (HTML)</label>
                  <BlogRichTextEditor
                    value={article.steps?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.articles);
                      next[idx] = {
                        ...next[idx],
                        steps: { ...next[idx].steps, [activeLang]: value },
                      };
                      updateField(["articles"], next);
                    }}
                    placeholder="Steps"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tips (HTML)</label>
                  <BlogRichTextEditor
                    value={article.tips?.[activeLang] || ""}
                    onChange={value => {
                      const next = structuredClone(formData.articles);
                      next[idx] = {
                        ...next[idx],
                        tips: { ...next[idx].tips, [activeLang]: value },
                      };
                      updateField(["articles"], next);
                    }}
                    placeholder="Tips"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.articles || []),
                  {
                    slug: "",
                    title: { en: "", fa: "", ps: "" },
                    updated: "",
                    intro: { en: "", fa: "", ps: "" },
                    steps: { en: "", fa: "", ps: "" },
                    tips: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["articles"], next);
              }}
            >
              + Add Article
            </button>
          </div>
        </div>
      )}

      {/* Contact Editor */}
      {key === "contact" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Hero</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.hero?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "title"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Subtitle"
                value={formData.hero?.subtitle?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["hero", "subtitle"], e.target.value)
                }
              />
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Contact Info</h2>
            {formData.info?.map((item: any, idx: number) => (
              <div
                key={`contact-info-${idx}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">Info {idx + 1}</h3>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const next = structuredClone(formData.info || []);
                      next.splice(idx, 1);
                      updateField(["info"], next);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Icon name (lucide)"
                  value={item.icon || ""}
                  onChange={e => {
                    const next = structuredClone(formData.info || []);
                    next[idx] = { ...next[idx], icon: e.target.value };
                    updateField(["info"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Title"
                  value={item?.title?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.info || []);
                    const current = next[idx] || {};
                    const title =
                      current.title && typeof current.title === "object"
                        ? { ...current.title }
                        : { en: "", fa: "", ps: "" };
                    next[idx] = {
                      ...current,
                      title: { ...title, [activeLang]: e.target.value },
                    };
                    updateField(["info"], next);
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="Value"
                  value={item?.value?.[activeLang] || ""}
                  onChange={e => {
                    const next = structuredClone(formData.info || []);
                    const current = next[idx] || {};
                    const value =
                      current.value && typeof current.value === "object"
                        ? { ...current.value }
                        : { en: "", fa: "", ps: "" };
                    next[idx] = {
                      ...current,
                      value: { ...value, [activeLang]: e.target.value },
                    };
                    updateField(["info"], next);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                const next = [
                  ...(formData.info || []),
                  {
                    icon: "mapPin",
                    title: { en: "", fa: "", ps: "" },
                    value: { en: "", fa: "", ps: "" },
                  },
                ];
                updateField(["info"], next);
              }}
            >
              + Add Info Item
            </button>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Form</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Name label"
                value={formData.form?.nameLabel?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "nameLabel"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Email label"
                value={formData.form?.emailLabel?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "emailLabel"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Subject label"
                value={formData.form?.subjectLabel?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "subjectLabel"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Message label"
                value={formData.form?.messageLabel?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "messageLabel"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Submit label"
                value={formData.form?.submitLabel?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "submitLabel"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Success message"
                value={formData.form?.successMessage?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "successMessage"], e.target.value)
                }
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Error message"
                value={formData.form?.errorMessage?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["form", "errorMessage"], e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}

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
