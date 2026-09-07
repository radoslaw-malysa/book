import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getCalendarWeek, type CalendarFilters } from "@/api/calendar";

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

const CalendarWeek =  () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // loader (reat router + react query)
  const { filters: loaderFilters } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >
  const { data } = useSuspenseQuery(calendarQuery(loaderFilters));

  
  return <div>week</div>
}

export default CalendarWeek;