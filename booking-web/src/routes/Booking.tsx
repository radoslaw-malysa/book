import { Calendar } from "@/components/ui/calendar";
import { getBooking, type BookingResponse, type ProductFilters } from "@/services/booking"; 
import { useState } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

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

const Booking = () => {
  const { message } = useLoaderData() as BookingResponse;

  const [date, setDate] = useState<Date | undefined>(new Date())
  
  return (<div className="mx-auto w-full max-w-2xl">
    <h1>Wybierz datę i godzinę</h1>
    <div>
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(14)]"
        captionLayout="dropdown"
      />
    </div>
  </div>)
}

export default Booking