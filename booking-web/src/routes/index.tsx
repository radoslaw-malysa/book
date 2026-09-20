import { createBrowserRouter, Navigate } from "react-router";
import Booking, { loader as bookingLoader } from "./Booking";
import BookingLayout from "@/layouts/BookingLayout";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/rezerwacja' replace />
  },
  {
    path: "rezerwacja",
    Component: BookingLayout,
    children: [
      {
        index: true,
        Component: Booking,
        loader: bookingLoader
      },
    ]
  }
]);

// https://www.shadcn.io/blocks/calendar-meeting-scheduler
// https://www.shadcn.io/blocks/calendar-weekly-planner