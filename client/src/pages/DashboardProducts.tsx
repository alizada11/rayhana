import { useState, useMemo } from "react";
import { useMyProducts, useDeleteProduct } from "@/hooks/useProducts";
import ProductForm from "@/components/ProductForm";
import ProductDetailModal from "@/components/ProductDetailModal";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";

export default function DashboardProducts() {
  const { data: products = [], isLoading } = useMyProducts();
  const deleteMutation = useDeleteProduct();
  const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  const confirm = useConfirm();

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Get unique categories
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map(p => p.category).filter(Boolean))
    );
    const cats = ["all", ...unique];
    return cats;
  }, [products]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this product?",
      description: "This will permanently remove the product from inventory.",
      confirmText: "Delete product",
      cancelText: "Cancel",
      tone: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Product deleted.");
      },
      onError: () => {
        toast.error("Failed to delete product.");
      },
    });
  };

  const handleView = (product: any) => {
    setViewingProduct(product);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Products
          </h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Showing</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredProducts.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-gray-900">
            {categories.length - 1}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sizes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(product => {
                  const prices = Object.values(product.prices || {});
                  const minPrice = prices.length
                    ? Math.min(...(prices as number[]))
                    : 0;
                  const maxPrice = prices.length
                    ? Math.max(...(prices as number[]))
                    : 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(product.imageUrl)}
                            alt={product.title?.en}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.title?.en}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {product.description?.en}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{product.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {product.sizes?.slice(0, 3).map((size: number) => (
                            <span
                              key={size}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {size}
                            </span>
                          ))}
                          {product.sizes?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              +{product.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          ${minPrice.toFixed(2)}
                          {maxPrice > minPrice && ` - $${maxPrice.toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(product)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(product.id))}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No products found
                      </p>
                      <p className="text-gray-500">
                        {searchTerm || selectedCategory !== "all"
                          ? "Try adjusting your search or filter"
                          : "Get started by adding your first product"}
                      </p>
                      {!searchTerm && selectedCategory === "all" && (
                        <button
                          onClick={handleAdd}
                          className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </span>{" "}
              of <span className="font-medium">{filteredProducts.length}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
        />
      )}

      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
}
