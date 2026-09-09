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
  confirmed: { bg: 'border-l-blue-500 bg-blue-500/7', txt: 'text-blue-600 dark:text-blue-400' },
  completed: { bg: 'border-l-blue-500 bg-blue-500/7', txt: 'text-blue-600 dark:text-blue-400' },
  cancelled: { bg: 'border-l-red-500 bg-red-500/7', txt: 'text-red-600 dark:text-red-400' },
}

const AppointmentTip = ({ appointment }) => {
  console.log(appointment.state)
  return (<div className={`absolute top-0.5 left-0.5 right-0.5 z-10 ${(appointment.cut_start !== undefined) ? 'rounded-t-none' : 'rounded-t' } ${(appointment.cut_end !== undefined) ? 'rounded-b-none' : 'rounded-b' } border-l-2 px-1.5 py-1 ${stateBg[appointment.state].bg}`} style={{ top: appointment.offset + 'px', height: appointment.duration + 'px' }}>
    <div className={`line-clamp-2 font-medium text-xs ${stateBg[appointment.state].txt}`}>{appointment.service_name}</div>
    <div className="truncate text-muted-foreground text-xs">{appointment.hours}</div>
  </div>)
}

const ViewDay = ({data}: ViewWeekProps) => {
  
  const DayProviderAppointments = ({ day, provider_id }) => {
    if (data.items[day] && data.items[day][provider_id]) {
      const apps = data.items[day][provider_id];

      return (<>{apps.map((a) => (<AppointmentTip key={a.appointment_id} appointment={a} />))}</>)
    }

    return null;
  }
  
  return (<div>
    <div className="flex flex-wrap border-b">
      <div className="border-r w-12"></div>
      <div className="flex-grow flex">
      {data.days.map((item) => (
        <div key={item.week_day} className="basis-xl not-last:border-r flex flex-col items-center py-2 text-center transition-colors hover:bg-muted/50 ">
          <div className="text-muted-foreground text-xs">{item.week_day}</div>
          <div className="mt-0.5 font-medium text-sm">{item.date?.substring(8)}</div>
        </div>
      ))}
      </div>
    </div>
    
    <ScrollArea className="c-height w-full">
      <div className="flex flex-wrap border-b">
        <div className="border-r w-12"></div>
        {data.providers.map((prov) => (<div key={prov.id} className="basis-sm not-last:border-r flex justify-center">{prov.name}</div>))}
      </div>
      <div className="flex flex-wrap">
        <div className="border-r w-12 flex flex-col text-muted-foreground text-xs">
          {data.hours.map((h) => (
            <div key={h} className="c-h flex items-start justify-end pr-2 pt-1">{h}</div>
          ))}
        </div>
        <div className="flex-grow flex">

        </div>
      </div>
    </ScrollArea>
  </div>)
}

export default ViewDay