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

  const days = [
    { weekDay: 'wto', monthDay: 22, month: 'wrz', hours: ['10:00','12:00'] },
    { weekDay: 'śro', monthDay: 23, month: 'wrz', hours: ['10:00','12:00'] },
    { weekDay: 'czw', monthDay: 24, month: 'wrz', hours: ['10:00','12:00','14:00'] },
    { weekDay: 'pt', monthDay: 25, month: 'wrz', hours: ['10:00','12:00'] },
    { weekDay: 'sob', monthDay: 26, month: 'wrz', hours: ['10:00','12:00'] },
  ];

  return (<div className="mx-auto w-full h-svh flex items-center justify-center">
    <div className="w-full max-w-3xl px-4 flex flex-col gap-12">

      <h1 className="text-2xl font-semibold">Wybierz dzień i godzinę</h1>

      <div className="grid grid-cols-5 gap-3">

        {days.map((day) => (<div key={day.monthDay} className="flex flex-col items-center gap-6 py-6 px-3 border border-muted">
          <div className="flex flex-col items-center gap1">
            <div className="text-base font-semibold">{day.weekDay}</div>
            <div className="text-2xl font-semibold">{day.monthDay}</div>
            <div className="text-xs text-muted-foreground">{day.month}</div>
          </div>
          <div className="grid gap-4 w-full">
            {day.hours.map((hour) => <Button variant="secondary" className="text-sm">{hour}</Button>)}
          </div>
        </div>))}

      </div>
      
      


    </div>
  </div>)
}

export default Booking