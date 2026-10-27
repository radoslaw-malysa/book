import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

interface Slot {
  time: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayOfMonth: number;
  monthName: string;
  slots: Slot[];
}

interface DateSliderProps {
  visitDate: string;
  setVisitDateTime: (date: string, time: string) => void;
  visitTime: string;
  schedule: DaySchedule[];
}

const DateSlider = ({visitDate, setVisitDateTime, visitTime, schedule}: DateSliderProps) => {
  return <Card className="ring-0 shadow-none">
    <CardHeader>
      <CardTitle className="text-center text-xl font-semibold">Wybierz dzień i godzinę</CardTitle>
    </CardHeader>
    <CardContent className="px-12 pt-4 lg:pt-6">

        <Carousel
          opts={{
            align: "start",
            duration: 20
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {schedule.map((item) => (
              <CarouselItem key={item.date} className="basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-1">
                <div>
                  <div className="flex flex-col items-center mb-4 lg:mb-6">
                    <div className="text-base font-medium">{item.dayName}</div>
                    <div className="text-xl font-semibold">{item.dayOfMonth}</div>
                    <div className="text-muted-foreground">{item.monthName}</div>
                  </div>
                  <div className="flex flex-col gap-2 lg:gap-3">
                    {item.slots.map((slot) => <Button key={slot.time} onClick={() => setVisitDateTime(item.date, slot.time)} variant={(slot.isAvailable) ? ((visitDate === item.date && visitTime == slot.time) ? 'default' : 'secondary') : 'ghost'} className="xl:h-11" disabled={!slot.isAvailable}>{slot.time}</Button>)}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

      

    </CardContent>
  </Card>
}

export default DateSlider