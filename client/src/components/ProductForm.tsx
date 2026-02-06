import { useEffect, useState } from "react";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import { X } from "lucide-react";

type ProductFormProps = {
  product?: any;
  onClose: () => void;
};

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const isEdit = Boolean(product);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const resolveImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };
  const [imagePreview, setImagePreview] = useState<string | null>(
    resolveImageUrl(product?.imageUrl) || null
  );

  const [formData, setFormData] = useState({
    title: product?.title || { en: "", fa: "", ps: "" },
    description: product?.description || { en: "", fa: "", ps: "" },
    category: product?.category || "",
    imageUrl: product?.imageUrl || "",
    rating: product?.rating || 5,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    prices: product?.prices || {},
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJSONFieldChange = (
    field: "title" | "description",
    lang: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("title", JSON.stringify(formData.title));
    payload.append("description", JSON.stringify(formData.description));
    payload.append("category", formData.category);
    payload.append("imageUrl", formData.imageUrl);
    payload.append("rating", String(formData.rating));
    payload.append("sizes", JSON.stringify(formData.sizes));
    payload.append("colors", JSON.stringify(formData.colors));
    payload.append("prices", JSON.stringify(formData.prices));
    if (imageFile) payload.append("image", imageFile);

    if (isEdit) {
      updateMutation.mutate({ id: product.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }

    onClose();
  };

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!imageFile && product?.imageUrl) {
      setImagePreview(resolveImageUrl(product.imageUrl));
    }
  }, [imageFile, product?.imageUrl]);

  const handleArrayChange = (
    field: "sizes" | "colors",
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: any) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSizeToggle = (size: number) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      const nextSizes = exists
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];

      const nextPrices = { ...prev.prices };
      if (exists) {
        delete nextPrices[size];
      }

      return { ...prev, sizes: nextSizes, prices: nextPrices };
    });
  };

  const handleSizeChange = (index: number, newSize: number) => {
    setFormData(prev => {
      const nextSizes = [...prev.sizes];
      const oldSize = nextSizes[index];
      nextSizes[index] = newSize;

      const nextPrices = { ...prev.prices };
      if (oldSize !== newSize) {
        if (nextPrices[oldSize] !== undefined) {
          nextPrices[newSize] = nextPrices[oldSize];
          delete nextPrices[oldSize];
        }
      }

      return { ...prev, sizes: nextSizes, prices: nextPrices };
    });
  };

  const handlePriceChange = (size: number, price: number) => {
    setFormData(prev => ({
      ...prev,
      prices: { ...prev.prices, [size]: price },
    }));
  };

  const removeSize = (size: number) => {
    setFormData(prev => {
      const nextSizes = prev.sizes.filter(s => s !== size);
      const nextPrices = { ...prev.prices };
      delete nextPrices[size];
      return { ...prev, sizes: nextSizes, prices: nextPrices };
    });
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, 0],
    }));
  };

  const colorOptions = [
    { name: "Red", value: "#E63946" },
    { name: "White", value: "#F1FAEE" },
    { name: "Blue", value: "#457B9D" },
    { name: "Navy", value: "#1D3557" },
    { name: "Green", value: "#2A9D8F" },
    { name: "Yellow", value: "#E9C46A" },
    { name: "Orange", value: "#F4A261" },
    { name: "Purple", value: "#9B5DE5" },
  ];

  const sizeOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Product Title
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lang.toUpperCase()}
                  </label>
                  <input
                    type="text"
                    placeholder={`Title in ${lang}`}
                    value={formData.title[lang]}
                    onChange={e =>
                      handleJSONFieldChange("title", lang, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Description
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {lang.toUpperCase()}
                  </label>
                  <textarea
                    placeholder={`Description in ${lang}`}
                    value={formData.description[lang]}
                    onChange={e =>
                      handleJSONFieldChange("description", lang, e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Category & Image Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g., Shoes, Clothing, Accessories"
                value={formData.category}
                onChange={e => handleChange("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={e => handleChange("rating", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-lg font-bold text-primary">
                  {formData.rating} ★
                </span>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      setImageFile(e.target.files?.[0] || null);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl">📁</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload product image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Colors Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleArrayChange("colors", color.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.colors.includes(color.value)
                      ? "ring-2 ring-primary border-primary"
                      : "border-gray-300 hover:border-primary"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizes & Prices Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Sizes & Prices
              </h3>
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                + Add Size
              </button>
            </div>

            {/* Quick Size Toggle */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Quick select sizes:</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-1 rounded-lg border transition-all ${
                      formData.sizes.includes(size)
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size-Price Table */}
            <div className="space-y-3">
              {formData.sizes.map((size: number, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Size"
                      value={size}
                      onChange={e =>
                        handleSizeChange(index, Number(e.target.value))
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-400">→</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={formData.prices[size] || ""}
                        onChange={e =>
                          handlePriceChange(size, Number(e.target.value))
                        }
                        className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </span>
              ) : isEdit ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
