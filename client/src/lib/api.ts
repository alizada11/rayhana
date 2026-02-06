import api from "./axios";

// ---------- Types ----------
export interface UserData {
  [key: string]: any;
}

export type ProductData = FormData;

export interface CommentData {
  productId: string | number;
  content: string;
}

export interface UpdateProductParams {
  id: string | number;
  data: FormData;
}

export interface DeleteCommentParams {
  commentId: string | number;
}

// ---------- USERS API ----------
export const syncUser = async (userData: UserData) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

// ---------- PRODUCTS API ----------
export const getAllProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getProductById = async (id: string | number) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/products/my");
  return data;
};

export const createProduct = async (productData: ProductData) => {
  const { data } = await api.post("/products", productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async ({
  id,
  data: productData,
}: UpdateProductParams) => {
  const { data } = await api.put(`/products/${id}`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (id: string | number) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// ---------- COMMENTS API ----------
export const createComment = async ({ productId, content }: CommentData) => {
  const { data } = await api.post(`/comments/${productId}`, { content });
  return data;
};

export const deleteComment = async ({ commentId }: DeleteCommentParams) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};
