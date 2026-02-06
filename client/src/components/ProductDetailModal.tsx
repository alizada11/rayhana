import { X } from "lucide-react";

type ProductDetailModalProps = {
  product: any;
  onClose: () => void;
};

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const prices = Object.entries(product.prices || {});
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div>
              <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
                <img
                  src={resolveImageUrl(product.imageUrl)}
                  alt={product.title?.en}
                  className="w-full max-w-md object-contain rounded-lg"
                />
              </div>

              {/* Rating */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-bold ml-2">
                    {product.rating}
                  </span>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Titles */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.title?.en}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-700">Persian:</span>{" "}
                    {product.title?.fa}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-700">Pashto:</span>{" "}
                    {product.title?.ps}
                  </p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">
                    English Description
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {product.description?.en}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">
                    Persian Description
                  </h4>
                  <p
                    className="text-gray-600 bg-gray-50 p-4 rounded-lg"
                    dir="rtl"
                  >
                    {product.description?.fa}
                  </p>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Available Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes & Prices Table */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Sizes & Prices
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prices.map(([size, price]) => (
                        <tr key={size}>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {size}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            ${(price as number).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Sizes</p>
                    <p className="text-xl font-bold text-gray-900">
                      {sizes.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Colors</p>
                    <p className="text-xl font-bold text-gray-900">
                      {colors.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
