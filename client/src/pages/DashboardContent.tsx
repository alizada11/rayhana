import { useEffect, useMemo, useState } from "react";
import { useContent, useUpsertContent } from "@/hooks/useContent";
import MediaPicker from "@/components/MediaPicker";
import { Image as ImageIcon, Save } from "lucide-react";
import BlogRichTextEditor from "@/components/BlogRichTextEditor";

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

const CONTENT_KEYS = ["home", "about", "faq"] as const;

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
    return fallbackFaq;
  }, [key]);

  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (data?.data) {
      setFormData({ ...initialData, ...data.data });
    } else {
      setFormData(initialData);
    }
  }, [data, initialData]);

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
    upsert.mutate(formData);
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
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.featuredProduct?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["featuredProduct", "title"], e.target.value)
                }
              />
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
                (item: string, idx: number) => (
                  <input
                    key={idx}
                    className="border rounded-lg px-3 py-2"
                    placeholder={`Bullet ${idx + 1}`}
                    value={item}
                    onChange={e => {
                      const next = [...formData.featuredProduct.bullets];
                      next[idx] = e.target.value;
                      updateField(["featuredProduct", "bullets"], next);
                    }}
                  />
                )
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Story</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.story?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["story", "title"], e.target.value)
                }
              />
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
                    value={item.title || ""}
                    onChange={e => {
                      const next = structuredClone(formData.values);
                      next[idx] = { ...next[idx], title: e.target.value };
                      updateField(["values"], next);
                    }}
                  />
                  <div>
                    <label className="text-xs text-gray-500">Body</label>
                    <BlogRichTextEditor
                      value={item.body || ""}
                      onChange={value => {
                        const next = structuredClone(formData.values);
                        next[idx] = { ...next[idx], body: value };
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
      {key === "about" && (
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
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.story?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["story", "title"], e.target.value)
                }
              />
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
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h2 className="font-serif text-xl font-bold">Mission</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.mission?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["mission", "title"], e.target.value)
                }
              />
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
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Title"
                value={formData.founder?.title?.[activeLang] || ""}
                onChange={e =>
                  updateLangField(["founder", "title"], e.target.value)
                }
              />
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
