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

export async function getBooking(
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

export const getBooking_ = async (filters: BookingFilters = {}): Promise<Appointment> => {
  // new appointment on calendar
  if (typeof id === 'object' && id !== null) {
    const { start_time, provider_id } = id;
    const params = new URLSearchParams();
    params.set("start_time", start_time);
    params.set("provider_id", provider_id.toString());
    const query = params.toString();

    return getAppointmentsResponse(await fetch(`${appointmentsUrl}/0?${query}`));
  }

  return getAppointmentsResponse(await fetch(`${appointmentsUrl}/${id}`));
}

export const postBooking = async (item: Appointment): Promise<BookingResponse | ErrorMessage> =>
  getBookingResponse(
    await fetch(`${appointmentsUrl}/${item.id}`, {
      method: "POST",
      body: toFormData({json_data: JSON.stringify(item)}),
    }),
  );