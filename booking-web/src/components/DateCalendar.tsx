import { pl } from "date-fns/locale"
import { Calendar } from "./ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useEffect, useState } from "react"

interface DateCalendarProps {
  visitDate: string;
  setVisitDate: (value: string) => void;
  visitTime: string;
  setVisitTime: (value: string) => void;
  schedule: [];
}

const DateCalendar = ({visitDate, setVisitDate, visitTime, setVisitTime, schedule}: DateCalendarProps) => {
  const [date, setDate] = useState(new Date(visitDate));

  const handleDateChange = (val) => {
    const datePl = val.toLocaleDateString('pl-PL');
    const [d,m,y] = datePl.split('.');
    setVisitDate(`${y}-${m}-${d}`);
    setDate(val);
  }

  const handleTimeChange = (val) => {
    setVisitTime(val[0]);
  }

  return (<Card className="ring-0 shadow-none">
    <CardHeader>
      <CardTitle className="text-center text-xl font-semibold">Wybierz datę i godzinę</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-12 items-center">

        <div className="flex flex-col items-center gap-8 lg:gap-10">
        <Calendar 
          mode="single" 
          locale={pl}
          selected={date}
          onSelect={handleDateChange}
          className="p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(14)] md:[--text-xs:0.875rem]"
        />
        <Separator className="mb-2" />
        {schedule && <ToggleGroup variant="outline" value={[visitTime]} onValueChange={handleTimeChange} size="lg">
          {schedule.map((item) => <ToggleGroupItem key={item.start_time} value={item.start_time} aria-label={"Wybierz godzinę " + item.start_time} className="aria-pressed:bg-foreground aria-pressed:text-background" disabled={item.free !== 1}>
            {item.start_time}
          </ToggleGroupItem>)}
        </ToggleGroup>}
        </div>

      </div>
    </CardContent>
  </Card>)
}

export default DateCalendar