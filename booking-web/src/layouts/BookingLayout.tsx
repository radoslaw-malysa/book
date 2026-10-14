import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Outlet } from "react-router"
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getBooking, type BookingResponse, type ProductFilters } from "@/services/booking"; 

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Extract and parse search params
  const filters: ProductFilters = {
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    minPrice: url.searchParams.get("minPrice")
      ? Number(url.searchParams.get("minPrice"))
      : undefined,
    maxPrice: url.searchParams.get("maxPrice")
      ? Number(url.searchParams.get("maxPrice"))
      : undefined,
    limit: url.searchParams.get("limit")
      ? Number(url.searchParams.get("limit"))
      : 20, // sensible default
    skip: url.searchParams.get("skip")
      ? Number(url.searchParams.get("skip"))
      : 0,
    sort: (url.searchParams.get("sort") as "asc" | "desc") || undefined,
  };

  const data = await getBooking(filters);

  return data; // { products, total, ... }
}

const BookingLayout = () => {
  const { message } = useLoaderData() as BookingResponse;

  return (<div className="min-h-svh flex flex-col justify-between gap-8">
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
    <footer className="lg:h-22">&nbsp;</footer>
  </div>)
}

export default BookingLayout