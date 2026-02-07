import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import api from "@/lib/axios";
import { useRef, useState } from "react";

type BlogRichTextEditorProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function BlogRichTextEditor({
  value,
  placeholder,
  onChange,
}: BlogRichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const maxImageBytes = 5 * 1024 * 1024;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
            },
          };
        },
      }).configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: placeholder || "Write your story...",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] max-h-[420px] overflow-y-auto rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const isAllowedScheme = (value: string) => {
      const match = value.trim().match(/^([a-z][a-z0-9+.-]*):/i);
      if (!match) return false;
      const scheme = match[1].toLowerCase();
      return scheme === "http" || scheme === "https" || scheme === "mailto";
    };

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const safePreviousUrl =
      previousUrl && isAllowedScheme(previousUrl) ? previousUrl : "";
    const url = window.prompt("Enter URL", safePreviousUrl);
    if (url === null) return;
    const trimmedUrl = url.trim();
    if (trimmedUrl === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!isAllowedScheme(trimmedUrl)) {
      alert("Only http, https, or mailto links are allowed.");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmedUrl })
      .run();
  };

  const compressImage = async (file: File) => {
    const imageBitmap = await createImageBitmap(file);
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(imageBitmap.width, imageBitmap.height));
    const targetW = Math.round(imageBitmap.width * scale);
    const targetH = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
      type: "image/jpeg",
    });
  };

  const insertImageByUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const payload = new FormData();
    const compressed = await compressImage(file);
    if (compressed.size > maxImageBytes) {
      alert("Image is too large. Please use an image under 5MB.");
      return;
    }
    payload.append("image", compressed);
    setIsUploading(true);
    try {
      const { data } = await api.post("/blogs/uploads", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        const fullUrl = data.url.startsWith("http")
          ? data.url
          : `${apiBase}${data.url}`;
        editor?.chain().focus().setImage({ src: fullUrl }).run();
      }
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void insertImageByUpload(file);
    }
    if (e.target) e.target.value = "";
  };

  const getImageStyle = () => editor?.getAttributes("image")?.style || "";

  const applyImageStyle = (next: string) => {
    if (!editor?.isActive("image")) return;
    editor.chain().focus().updateAttributes("image", { style: next }).run();
  };

  const mergeImageStyle = (updates: string[]) => {
    const current = getImageStyle();
    const filtered = current
      .split(";")
      .map(s => s.trim())
      .filter(Boolean)
      .filter(
        s =>
          !s.startsWith("width:") &&
          !s.startsWith("max-width:") &&
          !s.startsWith("margin-left:") &&
          !s.startsWith("margin-right:") &&
          !s.startsWith("display:")
      );
    const next = [...filtered, ...updates].join("; ");
    applyImageStyle(next ? `${next};` : "");
  };

  const setAlign = (align: "left" | "center" | "right") => {
    if (align === "left") {
      mergeImageStyle(["display:block", "margin-left:0", "margin-right:auto"]);
    } else if (align === "right") {
      mergeImageStyle(["display:block", "margin-left:auto", "margin-right:0"]);
    } else {
      mergeImageStyle(["display:block", "margin-left:auto", "margin-right:auto"]);
    }
  };

  const setWidth = (width: "small" | "medium" | "full") => {
    if (width === "small") {
      mergeImageStyle(["width:40%", "max-width:520px"]);
    } else if (width === "medium") {
      mergeImageStyle(["width:70%", "max-width:900px"]);
    } else {
      mergeImageStyle(["width:100%", "max-width:100%"]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("bold") ? "bg-white text-primary" : "text-gray-600"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("italic") ? "bg-white text-primary" : "text-gray-600"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("strike") ? "bg-white text-primary" : "text-gray-600"
          }`}
          title="Strike"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("heading", { level: 2 })
              ? "bg-white text-primary"
              : "text-gray-600"
          }`}
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("bulletList")
              ? "bg-white text-primary"
              : "text-gray-600"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("orderedList")
              ? "bg-white text-primary"
              : "text-gray-600"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("link") ? "bg-white text-primary" : "text-gray-600"
          }`}
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-md hover:bg-white ${
            isUploading ? "text-gray-400" : "text-gray-600"
          }`}
          title="Insert Image"
          disabled={isUploading}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setAlign("left")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Align Left"
          disabled={!editor.isActive("image")}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setAlign("center")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Align Center"
          disabled={!editor.isActive("image")}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setAlign("right")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Align Right"
          disabled={!editor.isActive("image")}
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setWidth("small")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Small"
          disabled={!editor.isActive("image")}
        >
          <Minimize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setWidth("medium")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Medium"
          disabled={!editor.isActive("image")}
        >
          <span className="text-xs font-semibold">70%</span>
        </button>
        <button
          type="button"
          onClick={() => setWidth("full")}
          className={`p-2 rounded-md hover:bg-white ${
            editor.isActive("image") ? "text-gray-600" : "text-gray-300"
          }`}
          title="Full"
          disabled={!editor.isActive("image")}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {isUploading && (
          <span className="text-xs text-gray-500 ml-2">Uploading...</span>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
