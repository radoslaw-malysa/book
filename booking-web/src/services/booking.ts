import { API_URL, buildQueryString, toFormData, type ErrorMessage } from "./api";
import type { Appointment, Client } from "@/context/BookingContext";

export interface Service {
  id: number;
  name: string;
}

export interface BookingResponse {
  message: string;
  service: Service;
  service_id: number;
  visit_date: string;
  token?: string;
  schedule: [];
  kulturalna_szkola: number;
  client: Client;
  appointment: Appointment;
  calculation: [];
}

interface BookingPostData {
  client: Client;
  appointment: Appointment;
}

export interface BookingFilters {
  service_id?: string;
  date?: string;
}

/*export async function getBooking_(
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
}*/

const getBookingResponse = async (response: Response): Promise<BookingResponse> => {
  if (!response.ok) {
    throw new Error(`Unable to load appointment: ${response.status}`);
  }

  return response.json() as Promise<BookingResponse>;
};

export const getBooking = async (filters: BookingFilters = {}): Promise<BookingResponse> => {
  const queryString = buildQueryString(filters);
  const url = `${API_URL}/booking${queryString}`;
  return getBookingResponse(await fetch(url));
}

export const postBooking = async (data: BookingPostData): Promise<BookingResponse | ErrorMessage> =>
  getBookingResponse(
    await fetch(`${API_URL}/booking?t=1`, {
      method: "POST",
      body: toFormData({json_data: JSON.stringify(data)}),
    }),
  );

export const getBeforeVisit = async (token: string | undefined): Promise<BookingResponse> => {
  const url = `${API_URL}/booking/before-visit/${token}`;
  return getBookingResponse(await fetch(url));
}

export const getConfirmBooking = async (token: string | undefined): Promise<BookingResponse> => {
  const url = `${API_URL}/booking/confirm/${token}`;
  return getBookingResponse(await fetch(url));
}

export const getCancelBooking = async (token: string | undefined): Promise<BookingResponse> => {
  const url = `${API_URL}/booking/cancel/${token}`;
  return getBookingResponse(await fetch(url));
}

export const getConfirmEmail = async (token: string | undefined): Promise<BookingResponse> => {
  const url = `${API_URL}/booking/email-confirmation-admin/${token}`;
  return getBookingResponse(await fetch(url));
}

export const getNewAppEmail = async (token: string | undefined): Promise<BookingResponse> => {
  const url = `${API_URL}/booking/email-new-appointment/${token}`;
  return getBookingResponse(await fetch(url));
}