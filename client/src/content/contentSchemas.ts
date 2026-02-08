export type Lang = "en" | "fa" | "ps";

type BaseField = {
  label: string;
};

export type TextField = BaseField & {
  type: "text";
  path: string[];
  localized?: boolean;
};

export type RichTextField = BaseField & {
  type: "richtext";
  path: string[];
  localized?: boolean;
};

export type MediaField = BaseField & {
  type: "media";
  path: string[];
  accept: "image" | "video" | "both";
};

export type SelectField = BaseField & {
  type: "select";
  path: string[];
  options: { label: string; value: string }[];
};

export type StringListField = BaseField & {
  type: "string-list";
  path: string[];
  maxItems?: number;
};

export type ObjectListField = BaseField & {
  type: "object-list";
  path: string[];
  itemLabel: (index: number) => string;
  itemDefaults: Record<string, any>;
  fields: Array<
    | (TextField & { path: string[] })
    | (RichTextField & { path: string[] })
    | (SelectField & { path: string[] })
  >;
};

export type Field =
  | TextField
  | RichTextField
  | MediaField
  | SelectField
  | StringListField
  | ObjectListField;

export type ContentSection = {
  title: string;
  fields: Field[];
};

export type ContentSchema = {
  key: "home" | "about" | "faq" | "terms" | "privacy" | "help";
  sections: ContentSection[];
};

export const contentSchemas: Record<ContentSchema["key"], ContentSchema> = {
  home: {
    key: "home",
    sections: [
      {
        title: "Hero",
        fields: [
          {
            type: "text",
            label: "Hero title",
            path: ["hero", "title"],
            localized: true,
          },
          {
            type: "text",
            label: "Hero subtitle",
            path: ["hero", "subtitle"],
            localized: true,
          },
          {
            type: "text",
            label: "Hero CTA",
            path: ["hero", "cta"],
            localized: true,
          },
          {
            type: "media",
            label: "Hero media URL (video or image)",
            path: ["images", "heroVideo"],
            accept: "both",
          },
        ],
      },
      {
        title: "Featured Product",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["featuredProduct", "title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Description",
            path: ["featuredProduct", "description"],
            localized: true,
          },
          {
            type: "media",
            label: "Image URL",
            path: ["images", "featuredProduct"],
            accept: "image",
          },
          {
            type: "object-list",
            label: "Bullets",
            path: ["featuredProduct", "bullets"],
            itemLabel: index => `Bullet ${index + 1}`,
            itemDefaults: { text: { en: "", fa: "", ps: "" } },
            fields: [
              {
                type: "text",
                label: "Text",
                path: ["text"],
                localized: true,
              },
            ],
          },
        ],
      },
      {
        title: "Story",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["story", "title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Body",
            path: ["story", "body"],
            localized: true,
          },
          {
            type: "text",
            label: "CTA",
            path: ["story", "cta"],
            localized: true,
          },
          {
            type: "media",
            label: "Story image URL",
            path: ["images", "storyImage"],
            accept: "image",
          },
        ],
      },
      {
        title: "Values Cards",
        fields: [
          {
            type: "object-list",
            label: "Values",
            path: ["values"],
            itemLabel: index => `Card ${index + 1}`,
            itemDefaults: { title: "", body: "", icon: "star" },
            fields: [
              {
                type: "text",
                label: "Title",
                path: ["title"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Body",
                path: ["body"],
                localized: true,
              },
              {
                type: "select",
                label: "Icon",
                path: ["icon"],
                options: [
                  { label: "Star", value: "star" },
                  { label: "Shield", value: "shield" },
                  { label: "Globe", value: "globe" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  about: {
    key: "about",
    sections: [
      {
        title: "Hero",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["hero", "title"],
            localized: true,
          },
          {
            type: "text",
            label: "Subtitle",
            path: ["hero", "subtitle"],
            localized: true,
          },
        ],
      },
      {
        title: "Story",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["story", "title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Body",
            path: ["story", "body"],
            localized: true,
          },
          {
            type: "media",
            label: "Story image URL",
            path: ["images", "story"],
            accept: "image",
          },
        ],
      },
      {
        title: "Mission",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["mission", "title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Body",
            path: ["mission", "body"],
            localized: true,
          },
        ],
      },
      {
        title: "Founder",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["founder", "title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Body",
            path: ["founder", "body"],
            localized: true,
          },
        ],
      },
    ],
  },
  faq: {
    key: "faq",
    sections: [
      {
        title: "FAQ",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["title"],
            localized: true,
          },
          {
            type: "text",
            label: "Subtitle",
            path: ["subtitle"],
            localized: true,
          },
        ],
      },
      {
        title: "Questions",
        fields: [
          {
            type: "object-list",
            label: "Questions",
            path: ["items"],
            itemLabel: index => `Question ${index + 1}`,
            itemDefaults: {
              id: "",
              question: { en: "", fa: "", ps: "" },
              answer: { en: "", fa: "", ps: "" },
            },
            fields: [
              {
                type: "text",
                label: "Question",
                path: ["question"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Answer",
                path: ["answer"],
                localized: true,
              },
            ],
          },
        ],
      },
    ],
  },
  terms: {
    key: "terms",
    sections: [
      {
        title: "Terms Page",
        fields: [
          {
            type: "text",
            label: "Effective Date",
            path: ["effectiveDate"],
          },
          {
            type: "text",
            label: "Title",
            path: ["title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Intro",
            path: ["intro"],
            localized: true,
          },
          {
            type: "object-list",
            label: "Sections",
            path: ["sections"],
            itemLabel: index => `Section ${index + 1}`,
            itemDefaults: {
              title: { en: "", fa: "", ps: "" },
              body: { en: "", fa: "", ps: "" },
            },
            fields: [
              {
                type: "text",
                label: "Section Title",
                path: ["title"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Section Body",
                path: ["body"],
                localized: true,
              },
            ],
          },
        ],
      },
    ],
  },
  privacy: {
    key: "privacy",
    sections: [
      {
        title: "Privacy Policy",
        fields: [
          {
            type: "text",
            label: "Effective Date",
            path: ["effectiveDate"],
          },
          {
            type: "text",
            label: "Title",
            path: ["title"],
            localized: true,
          },
          {
            type: "richtext",
            label: "Intro",
            path: ["intro"],
            localized: true,
          },
          {
            type: "object-list",
            label: "Sections",
            path: ["sections"],
            itemLabel: index => `Section ${index + 1}`,
            itemDefaults: {
              title: { en: "", fa: "", ps: "" },
              body: { en: "", fa: "", ps: "" },
            },
            fields: [
              {
                type: "text",
                label: "Section Title",
                path: ["title"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Section Body",
                path: ["body"],
                localized: true,
              },
            ],
          },
        ],
      },
    ],
  },
  help: {
    key: "help",
    sections: [
      {
        title: "Help Center",
        fields: [
          {
            type: "text",
            label: "Title",
            path: ["center", "title"],
            localized: true,
          },
          {
            type: "text",
            label: "Subtitle",
            path: ["center", "subtitle"],
            localized: true,
          },
          {
            type: "text",
            label: "Contact Email",
            path: ["center", "contactEmail"],
          },
          {
            type: "object-list",
            label: "Help Sections",
            path: ["center", "sections"],
            itemLabel: index => `Section ${index + 1}`,
            itemDefaults: {
              slug: "",
              title: { en: "", fa: "", ps: "" },
              description: { en: "", fa: "", ps: "" },
              icon: "lifeBuoy",
            },
            fields: [
              {
                type: "text",
                label: "Slug",
                path: ["slug"],
              },
              {
                type: "text",
                label: "Title",
                path: ["title"],
                localized: true,
              },
              {
                type: "text",
                label: "Description",
                path: ["description"],
                localized: true,
              },
              {
                type: "select",
                label: "Icon",
                path: ["icon"],
                options: [
                  { label: "Life Buoy", value: "lifeBuoy" },
                  { label: "Package", value: "package" },
                  { label: "Refresh", value: "refresh" },
                  { label: "Shield", value: "shield" },
                ],
              },
            ],
          },
          {
            type: "object-list",
            label: "FAQs",
            path: ["center", "faqs"],
            itemLabel: index => `FAQ ${index + 1}`,
            itemDefaults: {
              question: { en: "", fa: "", ps: "" },
              answer: { en: "", fa: "", ps: "" },
            },
            fields: [
              {
                type: "text",
                label: "Question",
                path: ["question"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Answer",
                path: ["answer"],
                localized: true,
              },
            ],
          },
        ],
      },
      {
        title: "Help Articles",
        fields: [
          {
            type: "object-list",
            label: "Articles",
            path: ["articles"],
            itemLabel: index => `Article ${index + 1}`,
            itemDefaults: {
              slug: "",
              title: { en: "", fa: "", ps: "" },
              updated: "",
              intro: { en: "", fa: "", ps: "" },
              steps: { en: "", fa: "", ps: "" },
              tips: { en: "", fa: "", ps: "" },
            },
            fields: [
              {
                type: "text",
                label: "Slug",
                path: ["slug"],
              },
              {
                type: "text",
                label: "Title",
                path: ["title"],
                localized: true,
              },
              {
                type: "text",
                label: "Last Updated",
                path: ["updated"],
              },
              {
                type: "richtext",
                label: "Intro",
                path: ["intro"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Steps (HTML)",
                path: ["steps"],
                localized: true,
              },
              {
                type: "richtext",
                label: "Tips (HTML)",
                path: ["tips"],
                localized: true,
              },
            ],
          },
        ],
      },
    ],
  },
};
