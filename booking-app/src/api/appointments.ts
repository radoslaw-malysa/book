import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface Appointment {
  id: number;
  customer_id: number;
  salon_id: number;
  total_price: string;
  state: string | undefined | number;
  notes: string;
  create_time: string;
  create_ip: string;
  update_time: string;
  update_ip: string;
}

const appointmentsUrl = apiUrl + "/appointments";

export interface AppointmentFilters {
  q?: string;
  page?: string | number;
}

interface ApiItemsData {
  items: Appointment[];
  total_items: number;
  total_pages: number;
}

const getAppointmentsResponse = async (response: Response): Promise<Appointment> => {
  if (!response.ok) {
    throw new Error(`Unable to load appointment: ${response.status}`);
  }

  return response.json() as Promise<Appointment>;
};

export const getAppointments = async (filters: AppointmentFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${appointmentsUrl}?${query}` : appointmentsUrl);

  if (!response.ok) {
    throw new Error(`Unable to load appointments: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getAppointment = async (id: number): Promise<Appointment> =>
  getAppointmentsResponse(await fetch(`${appointmentsUrl}/${id}`));

export const updateAppointment = async (item: Appointment): Promise<Appointment | ErrorMessage> =>
  getAppointmentsResponse(
    await fetch(`${appointmentsUrl}/${item.id}`, {
      method: "POST",
      body: toFormData(item),
    }),
  );
