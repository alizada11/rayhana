import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useMyProducts, useDeleteProduct } from "@/hooks/useProducts";
import ProductForm from "@/components/ProductForm";

export default function DashboardProducts() {
  const { data: products, isLoading } = useMyProducts();
  const deleteMutation = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={handleAdd}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : products && products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2"
            >
              <img
                src={p.imageUrl}
                alt={p.title.en}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="font-bold text-lg">{p.title.en}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {p.description.en}
              </p>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(String(p.id))}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </>
  );
}
