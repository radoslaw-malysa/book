import { Outlet } from "react-router";

const AdminLayout = () => {
  return <>
    <h1>Admin</h1>
    <Outlet />
  </>
}

export default AdminLayout;