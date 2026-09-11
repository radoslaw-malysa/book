import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getCalendarWeek, type CalendarFilters, type AppointmentService } from "@/api/calendar";
import { Button } from "@/components/ui/button";
import { Calendar1, CalendarDays, ChevronDownIcon, Plus, SearchIcon, XIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import '@/features/appointments/calendar.css';
import ViewWeek from "@/features/appointments/ViewWeek";
import ViewDay from "@/features/appointments/ViewDay";


export const calendarQuery = (filters: CalendarFilters = {}) =>
  queryOptions({
    queryKey: ["calendar", filters.date ?? ""],
    queryFn: () => getCalendarWeek(filters),
  });

export const loader =
  (client: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    // const q = searchParams.get("q") ?? undefined;
    const date = searchParams.get("date") ?? undefined;
    
    const filters: CalendarFilters = {
      date: date,
    };

    await client.ensureQueryData(calendarQuery(filters));
    
    return { filters };
  };

const Calendary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    date: (searchParams.get("date") !== null && searchParams.get("date") !== '') ? new Date('2026-09-10') : new Date(),
  });
  
  // loader (reat router + react query)
  const { filters: loaderFilters } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >
  const { data } = useSuspenseQuery(calendarQuery(loaderFilters));

  //const [date, setDate] = useState<Date | undefined>(new Date());
  const setDateHandler = (d: Date) => {
    setFilters((current) => ({ ...current, date: d }))
  }
  
  const [view, setView] = useState<'week' | 'day'>('week');

  const dateString = `${filters.date.getFullYear()}-${String(filters.date.getMonth()+1).padStart(2,"0")}-${String(filters.date.getDate()).padStart(2,"0")}`

  const changeDayHandler = (d: string) => {
    setFilters((current) => ({ ...current, date: new Date(d) }))
    if (view === 'week') {
      setView('day')
    }
    // filters.date = new Date(d.split("-").map(Number).map((v,i) => i===1 ? v-1 : v))
    
  }

  // zmiany w filtrach
  useEffect(() => {
    const nextSearchParams = new URLSearchParams();
    
    if (filters.date instanceof Date) {
      nextSearchParams.set("date", dateString);
    }

    // optymelnie byloby sprawdzic czy zmienil sie tydzien
    if (nextSearchParams.toString() !== searchParams.toString()) {
      navigate({ search: nextSearchParams.toString() }, { replace: true });
    }
  }, [filters, navigate, searchParams])

  
  return <div className="flex gap-6 h-full">
    <div>
      <div className="flex flex-col gap-4">
        <Calendar mode="single" selected={filters.date} onSelect={setDateHandler} weekStartsOn={1} required captionLayout="dropdown" className="bg-muted p-0" />
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
            <Button className="cursor-pointer" variant={view === 'week' ? "default" : "secondary"}  onClick={() => setView('week')}><CalendarDays />Tydzień</Button>
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
        <div className="flex flex-wrap border-b">
          <div className="border-r w-12"></div>
          <div className="flex-grow flex">
          {data.days.map((item) => (
            <button onClick={() => changeDayHandler(item.date)} type="button" key={item.week_day} className="cursor-pointer basis-xl not-last:border-r flex gap-0.5 flex-col items-center py-1.5 text-center transition-colors hover:bg-muted/50 ">
              <div className="text-muted-foreground text-xs">{item.week_day}</div>
              <div className={`flex size-8 items-center justify-center rounded-full font-medium text-sm transition-colors ${view==='day' && dateString == item.date ? 'bg-foreground text-background' : ''}`}>{parseInt(item.date?.substring(8))}</div>
            </button>
          ))}
          </div>
        </div>
        {view === 'week' && <ViewWeek data={data} />}
        {view === 'day' && <ViewDay data={data} date={filters.date} />}
      </CardContent>
    </Card>
  </div>
}

export default Calendary;