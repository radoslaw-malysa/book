import { Outlet } from "react-router";
import { Button } from "../components/ui/button";
import { UserRound } from 'lucide-react'

const AdminLayout = () => {
  return <>
    <header className="h-16 flex justify-between items-center px-2">
      <div className="flex items-center gap-8">
        <img src="/images/logo.svg" alt="logo" />
        <nav>
          <ul className="flex gap-4 xl:gap-6">
            <li>
              <a href="">Rezerwacje</a>
            </li>
            <li>
              <a href="">Oferta</a>
            </li>
            <li>
              <a href="">Raporty</a>
            </li>
            <li>
              <a href="">Użytkownicy</a>
            </li>
            <li>
              <a href="">Historia</a>
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