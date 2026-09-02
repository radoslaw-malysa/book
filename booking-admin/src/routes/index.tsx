import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "../layouts/AdminLayout";
import Appointments from "../pages/Appointments";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/admin' replace />
  },
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: Appointments
      }
    ]
  }
]);

