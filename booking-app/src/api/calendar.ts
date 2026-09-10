import { apiUrl } from "./api";

export interface AppointmentService {
  id: number;
  service_id: number;
  provider_id: number;
  start_time: string;
  end_time: string;
}

interface ApiDay {
  date: string;
  week_day: string;
}

const calendarWeekUrl = apiUrl + "/calendar/week";

export interface CalendarFilters {
  date: string | undefined;
}

interface ApiItemsData {
  items: AppointmentService[];
  days: ApiDay[];
  hours: [];
  providers: [];
}

export const getCalendarWeek = async (filters: CalendarFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${calendarWeekUrl}?${query}` : calendarWeekUrl);

  if (!response.ok) {
    throw new Error(`Unable to load appointments: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};
