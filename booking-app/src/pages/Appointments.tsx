import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState, type FC } from "react";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, SearchIcon, XIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/useDebounce";
import { Paginate } from "@/components/Paginate";
import { getAppointments, type AppointmentFilters } from "@/api/appointments";
import AppointmentEdit from "@/features/appointments/AppointmentsEdit";

export const appointmentsQuery = (filters: AppointmentFilters = {}) =>
  queryOptions({
    queryKey: ["appointments", filters.q ?? "", filters.page ?? ""],
    queryFn: () => getAppointments(filters),
  });

export const loader =
  (client: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    const q = searchParams.get("q") ?? undefined;
    const page = searchParams.get("page") ?? undefined;

    const filters: AppointmentFilters = {
      q: q,
      page: page,
    };

    await client.ensureQueryData(appointmentsQuery(filters));
    
    return { filters };
  };

interface IndicatorProps {
  state: string
}

const StateIndicator: FC<IndicatorProps> = ({state}) => {
  const appointmentStates = {
    pending: { title: 'Niepotwierdzona', color: 'bg-amber-500' },
    confirmed: { title: 'Potwierdzona', color: 'bg-green-500' },
    cancelled: { title: 'Anulowana', color: 'bg-red-500' },
  }

  return (<div className="flex items-center gap-2"><span className={`size-1.5 rounded-full ${appointmentStates[state].color}`}></span><span className="text-muted-foreground">{appointmentStates[state].title}</span></div>)
}

const Appointments = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AppointmentFilters>({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? "",
  });
  
  // loader (reat router + react query)
  const { filters: loaderFilters } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >
  const { data } = useSuspenseQuery(appointmentsQuery(loaderFilters));
  
  // debounced q
  const [q, setQ] = useState(searchParams.get("q") ?? ""); // debounced filter
  const debouncedQ = useDebounce(q, 300)
  
  // edit record
  const [selectedId, setSelectedId] = useState<number | null>(null); 

  // paginacja
  const pageChangeHandler = (p: string) => {
    setFilters((current) => ({ ...current, page: p }))
  }

  useEffect(() => {
    setFilters((current) => ({ ...current, q: debouncedQ, page: "" }))
  }, [debouncedQ])

  // zmiany w filtrach
  useEffect(() => {
    const nextSearchParams = new URLSearchParams();
    
    if (filters.q) {
      nextSearchParams.set("q", filters.q);
    }
    if (filters.page) {
      nextSearchParams.set("page", filters.page);
    }

    if (nextSearchParams.toString() !== searchParams.toString()) {
      navigate({ search: nextSearchParams.toString() }, { replace: true });
    }
  }, [filters, navigate, searchParams])

  return (
    <Card className="w-full h-full shadow-none ring-0">
      <CardHeader>
        <CardTitle>Warsztaty</CardTitle>
        <CardAction>
          <div className="flex gap-2 items-center">
            <InputGroup>
              <InputGroupInput 
                name="q"
                placeholder="Szukaj..." 
                value={q} 
                onChange={(event) => setQ(event.target.value)}
                className="focus:min-w-sm " />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              {q && <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Wyczyść" title="Wyczyść" size="icon-xs" onClick={() => setQ('')}>
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>}
            </InputGroup>
            <Button 
              className="cursor-pointer" 
              onClick={() => setSelectedId(0)}
            ><Plus /> Dodaj warsztaty</Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Warsztaty</TableHead>
              <TableHead>Utworzono</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => setSelectedId(item.id)}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell className="font-medium">{item.customer_name}</TableCell>
                <TableCell>{item.service_name}{item.service_description && <div className="text-muted-foreground text-xs">{item.service_description}</div>}</TableCell>
                <TableCell>{item.create_time.substring(0, 16)}</TableCell>
                <TableCell><StateIndicator state={item.state} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      </CardContent>
      {data.total_pages > 1 && <CardFooter>
        <Paginate page={filters.page} totalPages={data.total_pages} onChange={pageChangeHandler} />
      </CardFooter>}
      <AppointmentEdit itemId={selectedId} onClose={() => setSelectedId(null)} />
    </Card>
  );
};

export default Appointments;
