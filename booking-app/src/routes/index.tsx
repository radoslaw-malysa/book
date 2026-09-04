import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import Appointments from "../pages/Appointments";
import Users, { loader as usersLoader } from "./Users";
import { queryClient } from "../lib/query-client";

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
        Component: Appointments
      },
      {
        path: "users",
        Component: Users,
        loader: usersLoader(queryClient)
      }
    ]
  }
]);
