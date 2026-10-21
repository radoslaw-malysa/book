import { type Appointment } from "@/context/BookingContext";
import { Card,  CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Clock } from "lucide-react";
import { Separator } from "./ui/separator";

interface CalculationReadProps {
  appointment: Appointment;
  calculation: [];
  nextHandler: () => void;
}

const CalculationVisit = ({appointment, calculation, nextHandler}: CalculationReadProps) => {
  
  return (<Card className="sticky lg:top-24 xshadow-lg">
    <CardHeader>
      <CardTitle>Twoja rezerwacja</CardTitle>
      {appointment.visit_date && <CardDescription className="inline-flex gap-1.5 items-center"><Clock size="16" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-4">

        <Separator  />

        {calculation.map((item) => <div key={item.id} className="flex flex-col gap-4">
          <div className="flex w-full items-center gap-3 justify-between py-3">
            <div className="text-sm leading-snug font-medium">{item.name}</div>
            <div className="text-sm font-semibold">{item.quantity} x {item.price * 1} zł</div>
          </div>
          <Separator  />
        </div>)}


        <div className="flex w-full items-center gap-3 justify-between py-3 text-base font-semibold">
          <div className="leading-snug">Razem</div>
          <div className="flex gap-4">
            {appointment.total_price != appointment.sell_price && <div className="line-through text-muted-foreground">{appointment.total_price * 1} zł</div>}
            <div>{appointment.sell_price * 1} zł</div>
          </div>
        </div>

        {appointment.kulturalna_szkola === 1 && <div className="text-xs text-muted-foreground mt-2">&#42; Preferencyjna cena dla beneficjentów programu "Kulturalna Szkoła na Mazowszu"</div>}
        
      </div>
    </CardContent>
  </Card>)
}

export default CalculationVisit