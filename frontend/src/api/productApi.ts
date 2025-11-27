// src/api/productApi.ts

const API_URL = "http://localhost:8000/api";

export async function createProduct(productData: FormData) {
  const res = await fetch(`${API_URL}/products/create/`, {
    method: "POST",
    credentials: "include",
    body: productData,
  });

  if (!res.ok) throw new Error("Error creating product");
  return res.json();
}

export async function deleteProduct(productId: number) {
  const res = await fetch(`${API_URL}/products/${productId}/delete/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error deleting product");
  return res.json();
}

export async function getMyProducts() {
  const res = await fetch(`${API_URL}/products/mine/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error fetching user products");
  return res.json();
}
