import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';

// 1. Define the types for your state objects
export interface Appointment {
  visit_date: string;
  visit_time: string;
  group_pax: number;
  id_offer: number;
}

export interface Client {
  customer_type: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
  email: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pax_care: number;
  notes: string;
  accept_processing: number;
  accept_regulations: number;
  accept_kultura_zl: number;
  age_1: number;
  age_2: number;
  age_3: number;
  age_4: number;
  age_5: number;
  age_6: number;
  age_7: number;
}

// 2. Define the shape of the Context
export interface BookingContextType {
  appointment: Appointment;
  client: Client;
  updateAppointment: (data: Partial<Appointment>) => void;
  updateClient: (data: Partial<Client>) => void;
  resetBooking: () => void;
}

// 3. Set up the initial default states
const initialAppointment: Appointment = {
  visit_date: '',
  visit_time: '',
  group_pax: 0,
  id_offer: 0,
};

const initialClient: Client = {
  customer_type: '',
  name: '',
  address: '',
  zip: '',
  city: '',
  phone: '',
  email: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  pax_care: 0,
  notes: '',
  accept_processing: 0,
  accept_regulations: 0,
  accept_kultura_zl: 0,
  age_1: 0,
  age_2: 0,
  age_3: 0,
  age_4: 0,
  age_5: 0,
  age_6: 0,
  age_7: 0
};

// 4. Create the Context (with undefined as initial value to catch out-of-bounds usage)
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// 5. Create the Provider Component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointment, setAppointment] = useState<Appointment>(initialAppointment);
  const [client, setClient] = useState<Client>(initialClient);

  // Use Partial<T> so you can update just one field at a time without passing the whole object
  const updateAppointment = useCallback((data: Partial<Appointment>) => {
    setAppointment((prev) => ({ ...prev, ...data }));
  }, []);

  const updateClient = useCallback((data: Partial<Client>) => {
    setClient((prev) => ({ ...prev, ...data }));
  }, []);

  const resetBooking = useCallback(() => {
    setAppointment(initialAppointment);
    setClient(initialClient);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        appointment,
        client,
        updateAppointment,
        updateClient,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// 6. Create a custom hook to use the context easily
export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};