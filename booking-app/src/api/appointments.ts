// import { apiUrl } from "./api";

export interface Appointment {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

const appointmentsUrl = "https://jsonplaceholder.typicode.com/users";

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(appointmentsUrl);

  if (!response.ok) {
    throw new Error(`Unable to load appointments: ${response.status}`);
  }

  return response.json() as Promise<Appointment[]>;
};


