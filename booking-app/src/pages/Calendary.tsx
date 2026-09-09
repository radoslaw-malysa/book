import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getCalendarWeek, type CalendarFilters, type AppointmentService } from "@/api/calendar";
import { Button } from "@/components/ui/button";
import { Calendar1, CalendarDays, ChevronDownIcon, Plus, SearchIcon, XIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import '@/features/appointments/calendar.css';
import ViewWeek from "@/features/appointments/ViewWeek";
import ViewDay from "@/features/appointments/ViewDay";


export const calendarQuery = (filters: CalendarFilters = {}) =>
  queryOptions({
    queryKey: ["calendar", filters.q ?? "", filters.page ?? ""],
    queryFn: () => getCalendarWeek(filters),
  });

export const loader =
  (client: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    const q = searchParams.get("q") ?? undefined;
    const page = searchParams.get("page") ?? undefined;
    
    const filters: CalendarFilters = {
      q: q,
      page: page,
    };

    await client.ensureQueryData(calendarQuery(filters));
    
    return { filters };
  };

const Calendary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // loader (reat router + react query)
  const { filters: loaderFilters } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >
  const { data } = useSuspenseQuery(calendarQuery(loaderFilters));

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<string>('week');

  
  return <div className="flex gap-6 h-full">
    <div>
      <div className="flex flex-col gap-4">
        <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" className="bg-muted p-0" />
        <Collapsible open={true}>
          <CollapsibleTrigger render={<Button variant="ghost" className="w-full">Sale<ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" /></Button>} />
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0">
            <FieldSet className="w-full pt-2">
              <FieldGroup className="gap-3">
                {data.providers.map((prov) => (<Field key={prov.id} orientation="horizontal">
                  <Checkbox name="providers[]" id={prov.id} html-value="1" defaultChecked />
                  <FieldLabel htmlFor={prov.id} className="font-normal cursor-pointer">{prov.name}</FieldLabel>
                </Field>))}
              </FieldGroup>
            </FieldSet>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
    <Card className="w-full h-full shadow-none ring-0 gap-4">
      <CardHeader>
        <CardTitle>
          <ButtonGroup>
            <Button className="cursor-pointer" variant={view === 'week' ? "default" : "secondary"}  onClick={() => setView('week')}><CalendarDays />Tydziań</Button>
            <Button className="cursor-pointer" variant={view === 'day' ? "default" : "secondary"} onClick={() => setView('day')}><Calendar1 />Dzień</Button>
          </ButtonGroup>
        </CardTitle>
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
            <Button><Plus /> Utwórz rezerwację</Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {view === 'week' && <ViewWeek data={data} />}
        {view === 'day' && <ViewDay data={data} />}
      </CardContent>
    </Card>
  </div>
}

export default Calendary;