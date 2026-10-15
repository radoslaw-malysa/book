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
}

const DateCalendar = ({visitDate, setVisitDate, visitTime, setVisitTime}: DateCalendarProps) => {
  const [date, setDate] = useState(new Date(visitDate));

  useEffect(() => {
    const datePl = date.toLocaleDateString('pl-PL');
    const [d,m,y] = datePl.split('.');
    setVisitDate(`${y}-${m}-${d}`);
  }, [date]);

  const handleTimeChange = (val) => {
    setVisitTime(val[0]);
  }

  return (<Card className="ring-0 shadow-none">
    <CardHeader>
      <CardTitle className="text-center">Wybierz datę i godzinę</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-12 items-center">
        <Calendar 
          mode="single" 
          locale={pl}
          selected={date}
          onSelect={setDate}
          className="p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(14)] md:[--text-xs:0.875rem]"
        />
        <Separator />
        <ToggleGroup variant="outline" value={[visitTime]} onValueChange={handleTimeChange} size="lg">
          <ToggleGroupItem value="10:00" aria-label="Godzina 10:00" className="aria-pressed:bg-foreground aria-pressed:text-background">
            10:00
          </ToggleGroupItem>
          <ToggleGroupItem value="12:00" aria-label="Toggle missed" className="aria-pressed:bg-foreground aria-pressed:text-background">
            12:00
          </ToggleGroupItem>
          <ToggleGroupItem value="14:00" aria-label="Toggle missed" className="aria-pressed:bg-foreground aria-pressed:text-background">
            14:00
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </CardContent>
  </Card>)
}

export default DateCalendar