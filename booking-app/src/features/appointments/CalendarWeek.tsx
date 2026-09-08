import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getCalendarWeek, type CalendarFilters, type AppointmentService } from "@/api/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const AppointmentTip = ({ appointment }) => {
  return (<div className={`absolute top-0.5 left-0.5 right-0.5 z-10 ${(appointment.cut_start !== undefined) ? 'rounded-t-none' : 'rounded-t' } ${(appointment.cut_end !== undefined) ? 'rounded-b-none' : 'rounded-b' } border-l-2 px-1.5 py-1 border-l-blue-500 bg-blue-500/5`} style={{ top: appointment.offset + 'px', height: appointment.duration + 'px' }}>
    <div className="line-clamp-2 font-medium text-xs text-blue-600 dark:text-blue-400">{appointment.service_name}</div>
    <div className="truncate text-muted-foreground text-xs">{appointment.hours}</div>
  </div>)
}

const CalendarWeek =  () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // loader (reat router + react query)
  const { filters: loaderFilters } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >
  const { data } = useSuspenseQuery(calendarQuery(loaderFilters));

  const DayProviderAppointments = ({ day, provider_id }) => {
    if (data.items[day] && data.items[day][provider_id]) {
      const apps = data.items[day][provider_id];

      return (<>
      {apps.map((a) => (<AppointmentTip key={a.appointment_id} appointment={a} />))}
      
      </>)
    }

    return null;
  }


  return (<div>
    <div className="flex flex-wrap border-b">
      <div className="border-r w-12"></div>
      <div className="flex-grow flex">
      {data.days.map((item) => (
        <div key={item.week_day} className="basis-sm not-last:border-r flex flex-col items-center py-2 text-center transition-colors hover:bg-muted/50 ">
          <div className="text-muted-foreground text-xs">{item.week_day}</div>
          <div className="mt-0.5 font-medium text-sm">{item.date}</div>
        </div>
      ))}
      </div>
    </div>
    
    <ScrollArea className="c-height w-full">
    {data.providers.map((prov) => (<div key={prov.id} className="w-full">
      <div className="border-b flex justify-center pt-4 pb-2 text-base font-semibold">{prov.name}</div>
      <div className="flex flex-wrap">
        <div className="border-r w-12 flex flex-col text-muted-foreground text-xs">
          {data.hours.map((h) => (
            <div key={h} className="c-h flex items-start justify-end pr-2 pt-1">{h}</div>
          ))}
        </div>
        <div className="flex-grow flex">
        {data.days.map((d) => (
          <div key={d.week_day} className="basis-sm flex flex-col justify-center items-center not-last:border-r relative">
            {data.hours.map((h) => (
              <div key={h} className="c-h"></div>
            ))}
            <DayProviderAppointments day={d.date} provider_id={prov.id} />
          </div>
        ))}
        </div>
      </div>
    </div>))}
    </ScrollArea>
  </div>)
}

export default CalendarWeek;