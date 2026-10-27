import Calculation from "@/components/Calculation";
//import DateCalendar from "@/components/DateCalendar";
import Steps from "@/components/Steps";
import { useLoaderData, useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getBooking, type BookingResponse, type BookingFilters } from "@/services/booking"; 
import { useBooking, type Appointment, type Client } from "@/context/BookingContext";
import { useEffect } from "react";
import DateSlider from "@/components/DateSlider";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Extract and parse search params
  const filters: BookingFilters = {
    service_id: url.searchParams.get("service_id") ?? undefined,
    date: url.searchParams.get("date") ?? undefined,
    time: url.searchParams.get("time") ?? undefined
  };

  const data = await getBooking(filters);

  return data; // { products, total, ... }
}

const Booking = () => {
  let navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { service, service_id, visit_date, schedule, kulturalna_szkola, is_trip_available } = useLoaderData() as BookingResponse;
  const { appointment, updateAppointment } = useBooking();

  // set service_id (lesson) from link
  useEffect(() => {
    updateAppointment({ service_id: service_id, lesson: service.lesson } as Partial<Appointment>);
  }, [service_id]);

  const handleDateTimeChange = (date: string, time: string) => {
    updateAppointment({ visit_date: date, visit_time: time } as Partial<Appointment>);

    const nextSearchParams = new URLSearchParams();
    const sid = searchParams.get('service_id');
    if (sid) { nextSearchParams.set("service_id", sid); }

    nextSearchParams.set("date", date);
    nextSearchParams.set("time", time);

    if (nextSearchParams.toString() !== searchParams.toString()) {
      navigate({ search: nextSearchParams.toString() }, { replace: true });
    }
  }

  const handleDateChange = (value: string) => {
    updateAppointment({ visit_date: value, visit_time: '' } as Partial<Appointment>);

    const nextSearchParams = new URLSearchParams();
    const sid = searchParams.get('service_id');
    if (sid) { nextSearchParams.set("service_id", sid); }

    nextSearchParams.set("date", value);

    if (nextSearchParams.toString() !== searchParams.toString()) {
      navigate({ search: nextSearchParams.toString() }, { replace: true });
    }
  }

  const handleAppointmentChange = (name: String, value: string | number) => {
    updateAppointment({ [name]: value } as Partial<Appointment>);
  }
  

  const nextHandler = () => {
    navigate("/rezerwacja/dane");
  }

  //console.log(appointment)

  return (<>
    {false && <Steps step={1} />}
    <section>
      <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {/*<DateCalendar visitDate={appointment.visit_date} setVisitDate={handleDateChange} visitTime={appointment.visit_time} setVisitTime={(val) => handleAppointmentChange('visit_time', val)} schedule={schedule} />*/}
          <DateSlider visitDate={appointment.visit_date} setVisitDateTime={handleDateTimeChange} visitTime={appointment.visit_time} schedule={schedule} />
        </div>
        <div>
          <Calculation service={service} kulturalna_szkola={kulturalna_szkola} nextHandler={nextHandler} is_trip_available={is_trip_available} />
        </div>
      </div>
    </section>
  </>)
}

export default Booking