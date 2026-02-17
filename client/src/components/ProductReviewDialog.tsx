import { useMemo, useState } from "react";
import {
  useCreateProductReview,
  useUpdateProductReview,
  useDeleteProductReview,
  Product,
  useProduct,
} from "@/hooks/useProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProductReviewDialog({ product, open, onOpenChange }: Props) {
  const createReview = useCreateProductReview();
  const updateReview = useUpdateProductReview();
  const deleteReview = useDeleteProductReview();
  const { data: liveProduct, isFetching, refetch } = useProduct(product.id);

  const reviews = useMemo(
    () => liveProduct?.reviews || product.reviews || [],
    [liveProduct?.reviews, product.reviews]
  );

  const [form, setForm] = useState({
    id: null as string | null,
    author: "",
    rating: 5,
    verified: true,
    text: { en: "", fa: "", ps: "" } as Record<string, string>,
  });

  const resetForm = () =>
    setForm({
      id: null,
      author: "",
      rating: 5,
      verified: true,
      text: { en: "", fa: "", ps: "" },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim()) {
      toast.error("Author is required");
      return;
    }
    const payload = {
      productId: product.id,
      review: {
        author: form.author.trim(),
        rating: Number(form.rating),
        verified: form.verified,
        text: form.text,
      },
    };
    if (form.id) {
      updateReview.mutate(
        { productId: product.id, reviewId: form.id, review: payload.review },
        {
          onSuccess: () => {
            toast.success("Review updated");
            resetForm();
            refetch();
          },
          onError: () => toast.error("Failed to update review"),
        }
      );
    } else {
      createReview.mutate(payload, {
        onSuccess: () => {
          toast.success("Review added");
          resetForm();
          refetch();
        },
        onError: () => toast.error("Failed to add review"),
      });
    }
  };

  const editReview = (rev: any) => {
    setForm({
      id: rev.id,
      author: rev.author || "",
      rating: rev.rating ?? 5,
      verified: rev.verified ?? true,
      text: { en: "", fa: "", ps: "", ...(rev.text || {}) },
    });
  };

  const removeReview = (id: string) => {
    deleteReview.mutate(
      { productId: product.id, reviewId: id },
      {
        onSuccess: () => {
          toast.success("Review deleted");
          refetch();
        },
        onError: () => toast.error("Failed to delete review"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Product Reviews</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Author</label>
                <input
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={form.author}
                  onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={form.rating}
                  onChange={e =>
                    setForm(prev => ({ ...prev, rating: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-foreground mt-6">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={e =>
                    setForm(prev => ({ ...prev, verified: e.target.checked }))
                  }
                />
                Verified
              </label>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {["en", "fa", "ps"].map(lang => (
                <div key={lang}>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Review ({lang.toUpperCase()})
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={2}
                    value={form.text[lang] || ""}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        text: { ...prev.text, [lang]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={createReview.isPending || updateReview.isPending}
              >
                {form.id ? "Update Review" : "Add Review"}
              </Button>
              {form.id && (
                <Button variant="ghost" type="button" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {isFetching && (
              <p className="text-sm text-muted-foreground">Refreshing reviews...</p>
            )}
            {reviews.length === 0 && !isFetching && (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
            {reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="flex items-start justify-between border border-border rounded-lg p-3 bg-background"
              >
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <span>{rev.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {rev.rating} / 5
                    </span>
                    {rev.verified && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(rev.text && (rev.text["en"] || Object.values(rev.text)[0])) || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => editReview(rev)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => removeReview(rev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
