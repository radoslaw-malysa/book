import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getAppointments } from "../api/appointments";

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
  
  return <>Appointments</>
}

export default Appointments;