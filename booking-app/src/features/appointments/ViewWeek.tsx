import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewWeekProps {
  data: {
    items: [];
    providers: [];
    hours: [];
    days: [];
  };
}

const stateBg = {
  pending: { bg: 'border-l-amber-500 bg-amber-500/7', txt: 'text-amber-600 dark:text-amber-400' },
  confirmed: { bg: 'border-l-green-500 bg-green-500/7', txt: 'text-green-600 dark:text-green-400' },
  cancelled: { bg: 'border-l-red-500 bg-red-500/7', txt: 'text-red-600 dark:text-red-400' }
}
//completed: { bg: 'border-l-blue-500 bg-green-500/7', txt: 'text-green-600 dark:text-green-400' },

const AppointmentTip = ({ appointment }) => {
  return (<div className={`absolute top-0.5 left-0.5 right-0.5 z-10 ${(appointment.cut_start !== undefined) ? 'rounded-t-none' : 'rounded-t-sm' } ${(appointment.cut_end !== undefined) ? 'rounded-b-none' : 'rounded-b-sm' } border-l-3 px-1.5 py-1 ${stateBg[appointment.state].bg}`} style={{ top: appointment.offset + 'px', height: appointment.duration + 'px' }}>
    <div className={`line-clamp-2 font-medium text-xs ${stateBg[appointment.state].txt}`}>{appointment.service_name}</div>
    <div className="truncate text-muted-foreground text-xs">{appointment.hours}</div>
  </div>)
}

const ViewWeek = ({data}: ViewWeekProps) => {
  
  const DayProviderAppointments = ({ day, provider_id }) => {
    if (data.items[day] && data.items[day][provider_id]) {
      const apps = data.items[day][provider_id];

      return (<>{apps.map((a) => (<AppointmentTip key={a.appointment_id} appointment={a} />))}</>)
    }

    return null;
  }
  
  return (<ScrollArea className="c-height w-full">
    {data.providers.map((prov) => (<div key={prov.id} className="w-full">
      <div className="border-b flex pt-4 pb-2 text-base font-semibold">{prov.name}</div>
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
    </ScrollArea>)
}

export default ViewWeek