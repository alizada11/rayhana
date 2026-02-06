import { useState } from "react";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";

type ProductFormProps = {
  product?: any;
  onClose: () => void;
};

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const isEdit = Boolean(product);

  const [sizes, setSizes] = useState<number[]>([]); // [7, 9, 12]
  const [prices, setPrices] = useState<Record<number, number>>({}); // { 7: 24.

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

    if (isEdit) {
      updateMutation.mutate({ id: product.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }

    onClose();
  };

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

  return (
    <div className="mb-6 p-4 border rounded-xl bg-gray-50">
      <h3 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Product" : "Add Product"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="grid grid-cols-3 gap-2">
          {["en", "fa", "ps"].map(lang => (
            <input
              key={lang}
              type="text"
              placeholder={`Title (${lang})`}
              value={formData.title[lang]}
              onChange={e =>
                handleJSONFieldChange("title", lang, e.target.value)
              }
              className="border p-2 rounded w-full"
              required
            />
          ))}
        </div>

        {/* Description */}
        <div className="grid grid-cols-3 gap-2">
          {["en", "fa", "ps"].map(lang => (
            <input
              key={lang}
              type="text"
              placeholder={`Description (${lang})`}
              value={formData.description[lang]}
              onChange={e =>
                handleJSONFieldChange("description", lang, e.target.value)
              }
              className="border p-2 rounded w-full"
              required
            />
          ))}
        </div>

        {/* Category & Image */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={e => handleChange("category", e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={e => handleChange("imageUrl", e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Rating */}
        <input
          type="number"
          min={1}
          max={5}
          placeholder="Rating"
          value={formData.rating}
          onChange={e => handleChange("rating", Number(e.target.value))}
          className="border p-2 rounded w-24"
        />

        {/* Sizes */}
        <div>
          <label className="font-bold">Sizes (click to toggle)</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {[7, 9, 12, 15].map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleArrayChange("sizes", size)}
                className={`px-3 py-1 rounded border ${
                  formData.sizes.includes(size)
                    ? "bg-primary text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="font-bold">Colors (click to toggle)</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {["#E63946", "#F1FAEE", "#457B9D", "#1D3557"].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleArrayChange("colors", color)}
                className={`px-3 py-1 rounded border ${
                  formData.colors.includes(color)
                    ? "bg-primary text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-bold">Sizes & Prices</h4>

            {sizes.map((size, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Size"
                  value={size}
                  onChange={e => {
                    const newSize = Number(e.target.value);
                    const newSizes = [...sizes];
                    newSizes[index] = newSize;
                    setSizes(newSizes);
                  }}
                  className="border px-2 py-1 rounded w-20"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={prices[size] || ""}
                  onChange={e => {
                    const newPrice = Number(e.target.value);
                    setPrices(prev => ({ ...prev, [size]: newPrice }));
                  }}
                  className="border px-2 py-1 rounded w-28"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSizes(sizes.filter(s => s !== size));
                    setPrices(prev => {
                      const copy = { ...prev };
                      delete copy[size];
                      return copy;
                    });
                  }}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSizes([...sizes, 0])} // Add a new size
              className="mt-2 px-4 py-2 bg-primary text-white rounded"
            >
              Add Size
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            {isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
