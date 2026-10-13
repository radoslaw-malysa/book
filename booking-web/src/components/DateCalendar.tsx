import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"

const DateCalendar = () => {
  return (<Card className="ring-0 shadow-none">
    <CardHeader>
      <CardTitle className="text-center">Wybierz datę i godzinę</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-12 items-center">
        <Calendar mode="single" />
        <Separator />
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <Button variant="secondary" size="lg">10:00</Button>
        </div>
      </div>
    </CardContent>
  </Card>)
}

export default DateCalendar