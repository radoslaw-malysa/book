import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Outlet } from "react-router"

const BookingLayout = () => {
  return (<div className="h-svh flex flex-col justify-between">
    <section className="flex-none h-14 lg:h-22 flex items-center w-full sticky top-0 bg-background z-1">
      <div className="w-9/10 max-w-8xl mx-auto flex items-center justify-between">
        <a href="/" className="inline-block">
          <img src="/images/logo-l.svg" alt="Elektrownia Mazowieckie Centrum Sztuki Współczesnej logo" className="hidden lg:block h-7 lg:h-12 wcag-magnifier-hidden" />
          <img src="/images/logo-only-l.svg" alt="Elektrownia logo wersja mobile" className="block lg:hidden h-7 lg:h-12 wcag-magnifier-block" />
        </a>
        <Button variant="outline" size="icon-lg">
          <X />
        </Button>
      </div>
    </section>
    <Outlet />
    <footer className="lg:h-22"></footer>
  </div>)
}

export default BookingLayout