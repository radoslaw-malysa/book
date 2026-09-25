import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface Appointment {
  id: number;
  service_id: number;
  customer_id: number;
  salon_id: number;
  visit_time: string;
  lesson: number;
  tour: number;
  cinema: number;
  blockade: number;
  kulturalna_szkola: number;
  pax: number;
  kultura_za_zl: number;
  total_price: string;
  sell_price: string;
  sell_doc: string;
  state: string | undefined | number;
  notes: string;
  create_time: string;
  create_ip: string;
  update_time: string;
  update_ip: string;
  service_name: string;
  service_description: string;
  customer_name: string;
  appointment_providers: [];
  providers: [];
  customer: [];
}

const appointmentsUrl = apiUrl + "/appointments";

export interface AppointmentFilters {
  q?: string;
  page?: string | number;
  range?: {};
  from?: string | Date | undefined;
  to?: string | Date | undefined;
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
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();
  const response = await fetch(query ? `${appointmentsUrl}?${query}` : appointmentsUrl);

  if (!response.ok) {
    throw new Error(`Unable to load appointments: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getAppointment = async (id: number | {visit_time: string, provider_id: number} | null): Promise<Appointment> => {
  // new appointment on calendar
  if (typeof id === 'object' && id !== null) {
    const { visit_time, provider_id } = id;
    const params = new URLSearchParams();
    params.set("visit_time", visit_time);
    params.set("provider_id", provider_id.toString());
    const query = params.toString();

    return getAppointmentsResponse(await fetch(`${appointmentsUrl}/0?${query}`));
  }

  return getAppointmentsResponse(await fetch(`${appointmentsUrl}/${id}`));
}

export const updateAppointment = async (item: Appointment): Promise<Appointment | ErrorMessage> =>
  getAppointmentsResponse(
    await fetch(`${appointmentsUrl}/${item.id}`, {
      method: "POST",
      body: toFormData({json_data: JSON.stringify(item)}),
    }),
  );
