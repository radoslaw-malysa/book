import { API_URL, buildQueryString, type ErrorMessage } from "./api";

export interface Service {
  id: number;
  name: string;
}

export interface BookingResponse {
  message: string;
  service: Service;
  total: number;
  // optional pagination fields depending on your API
  skip?: number;
  limit?: number;
}

export interface BookingFilters {
  service_id?: number;
}

export async function getBooking_(
  filters: BookingFilters = {}
): Promise<BookingResponse> {
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

  const data: BookingResponse = await response.json();
  return data;
}

const getBookingResponse = async (response: Response): Promise<BookingResponse> => {
  if (!response.ok) {
    throw new Error(`Unable to load appointment: ${response.status}`);
  }

  return response.json() as Promise<Appointment>;
};

export const getBooking = async (filters: BookingFilters = {}): Promise<BookingResponse> => {
  const queryString = buildQueryString(filters);
  const url = `${API_URL}/booking${queryString}`;

  return getBookingResponse(await fetch(url));
}

export const postBooking = async (data: Appointment): Promise<BookingResponse | ErrorMessage> =>
  getBookingResponse(
    await fetch(`${API_URL}/booking`, {
      method: "POST",
      body: toFormData({json_data: JSON.stringify(data)}),
    }),
  );