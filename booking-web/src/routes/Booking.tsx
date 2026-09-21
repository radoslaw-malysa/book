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

  return (<div className="mx-auto w-full h-svh flex items-center justify-center">
    <div className="w-full max-w-6xl px-4 flex flex-row gap-16">
      
      <div className="basis-3/5 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Wybierz datę i godzinę</h1>
        <div className="grid grid-cols-5 gap-8">

          <div className="flex flex-col gap-8">
            <div className="border-3 border-muted flex flex-col items-center px-2 py-4">
              <div className="text-base font-semibold">wt</div>
              <div className="text-2xl font-semibold">22</div>
              <div className="text-xs">wrz</div>
            </div>
            <div className="grid gap-4">
              <Button variant="secondary" className="text-sm">10:00</Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="border-3 border-muted flex flex-col items-center px-2 py-4">
              <div className="text-base font-semibold">śro</div>
              <div className="text-2xl font-semibold">23</div>
              <div className="text-xs">wrz</div>
            </div>
            <div className="grid gap-4">
              <Button variant="ghost" disabled className="text-sm">10:00</Button>
              <Button variant="secondary" className=" text-sm">12:00</Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="border-3 border-foreground flex flex-col items-center px-2 py-4">
              <div className="text-base font-semibold">czw</div>
              <div className="text-2xl font-semibold">24</div>
              <div className="text-xs">wrz</div>
            </div>
            <div className="grid gap-4">
              <Button variant="outline" className="border-3 border-foreground text-sm">10:00</Button>
              <Button variant="secondary" className="text-sm">12:00</Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="border-3 border-muted flex flex-col items-center px-2 py-4">
              <div className="text-base font-semibold">śro</div>
              <div className="text-2xl font-semibold">23</div>
              <div className="text-xs">wrz</div>
            </div>
            <div className="grid gap-4">
              <Button variant="ghost" disabled className="text-sm">10:00</Button>
              <Button variant="secondary" className=" text-sm">12:00</Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="border-3 border-muted flex flex-col items-center px-2 py-4">
              <div className="text-base font-semibold">śro</div>
              <div className="text-2xl font-semibold">23</div>
              <div className="text-xs">wrz</div>
            </div>
            <div className="grid gap-4">
              <Button variant="ghost" disabled className="text-sm">10:00</Button>
              <Button variant="secondary" className=" text-sm">12:00</Button>
            </div>
          </div>
          

        </div>
      </div>
      <div className="basis-2/5">
        <Card className="shadow-none ring-3 ring-foreground">
          <CardHeader>
            <CardTitle>Twoja rezerwacja</CardTitle>
          </CardHeader>
          <CardContent>

            <Item variant="muted" className="w-full">
              <ItemMedia variant="icon">
                <InboxIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Warsztaty</ItemTitle>
                <ItemDescription>
                  Warsztaty sensoryczno-plastyczne „Bajki z pieca”
                </ItemDescription>
              </ItemContent>
            </Item>

            <Item variant="muted" className="w-full">
              <ItemMedia variant="icon">
                <InboxIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Wstęp na wystawy</ItemTitle>
              </ItemContent>
            </Item>

            <Item variant="muted" className="w-full">
              <ItemMedia variant="icon">
                <InboxIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Zwiedzanie wystaw z przewodnikiem</ItemTitle>
              </ItemContent>
            </Item>


          </CardContent>
        </Card>
      </div>

    </div>
  </div>)
}

export default Booking