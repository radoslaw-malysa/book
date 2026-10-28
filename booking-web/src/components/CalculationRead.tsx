import { useBooking } from "@/context/BookingContext";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Separator } from "./ui/separator";
import { Item, ItemContent } from "./ui/item";

interface CalculationReadProps {
  nextHandler: () => void;
}

const CalculationRead = ({nextHandler}: CalculationReadProps) => {
  const { appointment } = useBooking();
  const navigate = useNavigate();
  
  // calculation
  let totalPrice = 0;
  let sellPrice = 0;

  if (appointment.lesson) {
    totalPrice += appointment.pax * appointment.lesson.price
  }
  if (appointment.guide) {
    totalPrice += appointment.pax * appointment.guide.price
  }
  if (appointment.kulturalna_szkola === 1) {
    sellPrice = appointment.pax * 1;
  } else {
    sellPrice = totalPrice;
  }

  return (<Card className="sticky lg:top-24 xshadow-lg">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">Twoja rezerwacja</CardTitle>
      {appointment.visit_date && <CardDescription className="inline-flex gap-1.5 items-center"><Clock size="16" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
      <CardAction>
        <Button size="lg" variant="secondary" onClick={() => navigate(-1)}><ArrowLeft data-icon="inline-start" /> Zmień</Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <Item variant="muted">
        <ItemContent>
          {appointment.lesson && <div className="flex w-full items-center gap-3 justify-between py-3">
            <div className="text-sm leading-snug font-medium">{appointment.lesson.name}</div>
            <div className="text-sm font-semibold">{appointment.pax} x {appointment.lesson.price * 1} zł</div>
          </div>}

          {appointment.guide !== null && <Separator />}
          {appointment.guide !== null && <div className="flex w-full items-center gap-3 justify-between py-3">
            <div className="text-sm leading-snug font-medium">{appointment.guide.name}</div>
            <div className="text-sm font-semibold">{appointment.pax} x {appointment.guide.price * 1} zł</div>
          </div>}

          {(appointment.kulturalna_szkola === 1 && appointment.zip_valid) && <Separator />}
          {(appointment.kulturalna_szkola === 1 && appointment.zip_valid) && <div className="flex w-full items-center gap-3 justify-between py-3">
            <div className="text-sm leading-snug font-medium">Uczestniczę w programie “Kulturalna Szkoła na Mazowszu”</div>
          </div>}

          <Separator />

          <div className="flex w-full items-center gap-3 justify-between py-3 text-base">
          <div className="leading-snug font-semibold">Razem</div>

          {(appointment.kulturalna_szkola === 1 && appointment.zip_valid) && <div className="flex gap-4">
            <div className="line-through text-muted-foreground">{totalPrice} zł</div>
            <div className="font-semibold">{sellPrice} zł&#42;</div>
          </div>}
          {(appointment.kulturalna_szkola !== 1 || appointment.zip_valid === '') && <div className="flex gap-4">
            <div>{totalPrice} zł</div>
          </div>}
        </div>

        </ItemContent>
      </Item>


      <div className="flex flex-col gap-4">
        

        

        {appointment.kulturalna_szkola === 1 && <div className="text-xs text-muted-foreground mt-2">&#42; Preferencyjna cena dla beneficjentów programu "Kulturalna Szkoła na Mazowszu"</div>}

      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={nextHandler} size="lg" className="w-full">Zapisz rezerwację <ArrowRight data-icon="inline-end" /></Button>
    </CardFooter>
  </Card>)
}

export default CalculationRead