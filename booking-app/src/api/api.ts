export const apiUrl = (window.location.hostname == 'localhost') ? 'http://book.test/booking-api' : '/booking-api';

export const toFormData = (o) => {
  return Object.entries(o).reduce((d,e) => (d.append(...e),d), new FormData())
}

export interface ErrorMessage {
  error?: number;
  message: string;
}