import Calculation from "@/components/Calculation";
import DateCalendar from "@/components/DateCalendar";
import Steps from "@/components/Steps";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { getBooking, type BookingResponse, type ProductFilters } from "@/services/booking"; 
import { InboxIcon } from "lucide-react";
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

  return (<>
    {false && <Steps step={1} />}
    <section>
      <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <DateCalendar />
        </div>
        <div>
          <Calculation />
        </div>
      </div>
    </section>
  </>)
}

export default Booking