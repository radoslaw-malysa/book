import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getAppointments } from "../api/appointments";
import { Button } from "@/components/ui/button";
import { CalendarDays, ListIcon, Plus, SearchIcon, XIcon } from "lucide-react";
import ViewCalendar from "@/features/appointments/ViewCalendar";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const appointmetsListQuery = (q?: string) => queryOptions({
  queryKey: ['contacts', 'list', q ?? 'all'],
  queryFn: () => getAppointments(q)
})

export const loader = (queryClient: QueryClient) => async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  //const q = url.searchParams.get('q') ?? ''
  const q = url.search;

  await queryClient.ensureQueryData(appointmetsListQuery(q))
  return { q }
}

const Appointments = () => {
  const { q } = useLoaderData as Awaited<ReturnType<typeof loader>>
  const { data } = useSuspenseQuery(appointmetsListQuery(''))
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  return <div className="flex gap-6 px-2 h-full">
    <div>
      <div className="py-4">
        <Button size="lg" className="cursor-pointer w-full"><Plus /> Utwórz rezerwację</Button>
      </div>
      <div>
        <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" />
      </div>
    </div>
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Rezerwacje</CardTitle>
        <CardAction>
          <div className="flex gap-2 items-center">
            <InputGroup>
              <InputGroupInput placeholder="Szukaj..." className="focus:min-w-sm " />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Wyczyść" title="Wyczyść" size="icon-xs">
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <ButtonGroup>
              <Button className="cursor-pointer"><CalendarDays />Kalendarz</Button>
              <Button className="cursor-pointer" variant="secondary"><ListIcon />Lista</Button>
            </ButtonGroup>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ViewCalendar />
      </CardContent>
    </Card>
  </div>
}

export default Appointments;