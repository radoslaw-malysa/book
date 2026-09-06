import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import Appointments, { loader as appointmentsLoader }  from "../pages/Appointments";
import Users, { loader as usersLoader } from "../pages/Users";
import { queryClient } from "../lib/query-client";
import Services, { loader as servicesLoader } from "@/pages/Services";
import AppointmentsCalendar from "@/pages/AppointmentsCalendar";
import Categories, { loader as categoriesLoader } from "@/pages/Categories";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/admin' replace />
  },
  {
    path: "booking",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: AppointmentsCalendar
      },
      {
        path: "appointments",
        Component: Appointments,
        loader: appointmentsLoader(queryClient)
      },
      {
        path: "services",
        Component: Services,
        loader: servicesLoader(queryClient)
      },
      {
        path: "categories",
        Component: Categories,
        loader: categoriesLoader(queryClient)
      },
      {
        path: "users",
        Component: Users,
        loader: usersLoader(queryClient)
      }
    ]
  }
]);
