// src/api/auctionApi.ts

const API_URL = "http://localhost:8000/api";

export async function getActiveAuctions() {
  const res = await fetch(`${API_URL}/auctions/active/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error fetching active auctions");
  return res.json();
}

export async function getMyAuctions() {
  const res = await fetch(`${API_URL}/auctions/mine/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error fetching your auctions");
  return res.json();
}

export async function getAuctionDetail(id: number) {
  const res = await fetch(`${API_URL}/auctions/${id}/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error fetching auction details");
  return res.json();
}

export async function createAuction(productId: number, durationHours: number, minPrice: number) {
  const res = await fetch(`${API_URL}/auctions/create/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      duration_hours: durationHours,
      precio_minimo: minPrice,
    }),
  });

  if (!res.ok) throw new Error("Error creating auction");
  return res.json();
}

export async function placeBid(auctionId: number, amount: number) {
  const res = await fetch(`${API_URL}/auctions/${auctionId}/bid/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) throw new Error("Error placing bid");
  return res.json();
}
