import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
} from "../lib/api";

// ---------- Types ----------
export type ID = string | number;

export interface Product {
  id: ID;
  productUrl?: string | null;
  reviews?: Array<{
    id: string;
    author: string;
    text: Record<string, string>;
    rating: number;
    verified?: boolean;
  }>;
  [key: string]: any;
}

export interface UpdateProductVariables {
  id: ID;
  data: FormData;
}

// ---------- Hooks ----------
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
    onError: err => {
      console.error("Create product failed:", err);
    },
  });
};

export const useProduct = (id?: ID) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as ID),
    enabled: Boolean(id),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useMyProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["myProducts"],
    queryFn: getMyProducts,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables: UpdateProductVariables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

// Reviews
export const useCreateProductReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProductReview,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["product", vars.productId] });
      qc.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useUpdateProductReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProductReview,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["product", vars.productId] });
      qc.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useDeleteProductReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProductReview,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["product", vars.productId] });
      qc.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};
