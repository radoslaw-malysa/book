import { Outlet } from "react-router";

const FrontLayout = () => {
  return <>
    <h1>Front</h1>
    <Outlet />
  </>
}

export default FrontLayout;