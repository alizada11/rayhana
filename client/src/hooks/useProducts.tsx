import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
} from "../lib/api";

// ---------- Types ----------
export type ID = string | number;

export interface Product {
  id: ID;
  [key: string]: any;
}

export interface UpdateProductVariables {
  id: ID;
  [key: string]: any;
}

// ---------- Hooks ----------
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
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
