import { API_URL, buildQueryString } from "./api";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  // add other fields as needed
}

export interface BookingResponse {
  message: string;
  products: Product[];
  total: number;
  // optional pagination fields depending on your API
  skip?: number;
  limit?: number;
}

export interface ProductFilters {
  q?: string;           // search query
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  skip?: number;
  sort?: "asc" | "desc";
  // extend as needed
}

export async function getBooking(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const queryString = buildQueryString(filters);
  const url = `${API_URL}/rezerwacja${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header here if needed
      // Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // You can throw a more specific error or use React Router's data APIs
    throw new Response(
      JSON.stringify({ message: "Failed to fetch products" }),
      { status: response.status, statusText: response.statusText }
    );
  }

  const data: ProductsResponse = await response.json();
  return data;
}