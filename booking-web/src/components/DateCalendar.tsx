import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"

const DateCalendar = () => {
  return (<Card className="ring-0 shadow-none">
    <CardHeader>
      <CardTitle className="text-center">Wybierz datę i godzinę</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-12 items-center">
        <Calendar 
          mode="single" 
          className="p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(14)]"
        />
        <Separator />
        <ToggleGroup variant="outline" defaultValue={["10:00"]}>
          <ToggleGroupItem value="10:00" aria-label="Toggle all">
            10:00
          </ToggleGroupItem>
          <ToggleGroupItem value="12:00" aria-label="Toggle missed">
            12:00
          </ToggleGroupItem>
          <ToggleGroupItem value="14:00" aria-label="Toggle missed">
            14:00
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </CardContent>
  </Card>)
}

export default DateCalendar