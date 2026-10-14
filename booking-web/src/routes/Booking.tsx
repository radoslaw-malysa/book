import Calculation from "@/components/Calculation";
import DateCalendar from "@/components/DateCalendar";
import Steps from "@/components/Steps";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { getBooking, type BookingResponse, type BookingFilters } from "@/services/booking"; 

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Extract and parse search params
  const filters: BookingFilters = {
    service_id: url.searchParams.get("service_id") ?? undefined
  };

  const data = await getBooking(filters);

  return data; // { products, total, ... }
}

const Booking = () => {
  let navigate = useNavigate();
  const { service } = useLoaderData() as BookingResponse;
  

  const nextHandler = () => {
    navigate("/rezerwacja/dane");
  }

  return (<>
    {false && <Steps step={1} />}
    <section>
      <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <DateCalendar />
        </div>
        <div>
          <Calculation nextHandler={nextHandler} />
        </div>
      </div>
    </section>
  </>)
}

export default Booking