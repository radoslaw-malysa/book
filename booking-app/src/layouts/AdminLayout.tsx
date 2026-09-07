import { Link, NavLink, Outlet } from "react-router";
import { Button } from "../components/ui/button";
import { UserRound } from 'lucide-react'

const AdminLayout = () => {
  return <>
    <header className="h-16 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <img src="/images/logo.svg" alt="logo" />
        <nav>
          <ul className="flex gap-4 xl:gap-6">
            <li>
              <NavLink to="/booking/calendar/week" end className={({ isActive }) => isActive ? "font-bold" : ""}>Kalendarz</NavLink>
            </li>
            <li>
              <NavLink to="/booking/appointments" className={({ isActive }) => isActive ? "font-bold" : ""}>Rezerwacje</NavLink>
            </li>
            <li>
              <NavLink to="/booking/services" className={({ isActive }) => isActive ? "font-bold" : ""}>Warsztaty</NavLink>
            </li>
            <li>
              <NavLink to="/booking/categories" className={({ isActive }) => isActive ? "font-bold" : ""}>Kategorie</NavLink>
            </li>
            <li>
              <NavLink to="/booking/providers" className={({ isActive }) => isActive ? "font-bold" : ""}>Sale</NavLink>
            </li>
            <li>
              <NavLink to="/booking/users" className={({ isActive }) => isActive ? "font-bold" : ""}>Użytkownicy</NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <Button size="icon"><UserRound /></Button>
      </div>
    </header>
    <Outlet />
  </>
}

export default AdminLayout;