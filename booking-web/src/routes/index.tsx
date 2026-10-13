import { createBrowserRouter, Navigate } from "react-router";
import Booking from "./Booking";
import BookingLayout, { loader as bookingLoader } from "@/layouts/BookingLayout";
import Client from "./Client";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/rezerwacja' replace />
  },
  {
    path: "rezerwacja",
    Component: BookingLayout,
    loader: bookingLoader,
    children: [
      {
        index: true,
        Component: Booking
      },
      {
        path: 'dane',
        Component: Client
      },
    ]
  }
]);

// https://www.shadcn.io/blocks/calendar-meeting-scheduler
// https://www.shadcn.io/blocks/calendar-weekly-planner