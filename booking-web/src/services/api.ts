export const API_URL = (window.location.hostname == 'localhost') ? 'http://book.test/booking-api' : '/booking-api';

export const toFormData = (o) => {
  return Object.entries(o).reduce((d,e) => (d.append(...e),d), new FormData())
}

export const buildQueryString = (filters: {}): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export interface ErrorMessage {
  error?: number;
  message: string;
}