import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "./ui/field"
import { ArrowLeft, ArrowRight, Clock, FileText, Minus, Plus } from "lucide-react"
import { useBooking } from "@/context/BookingContext"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { Item, ItemContent, ItemTitle } from "./ui/item"

interface CalculationProps {
  service: {};
  kulturalna_szkola: number;
  nextHandler: () => void;
}

const Calculation = ({service, kulturalna_szkola, nextHandler}: CalculationProps) => {
  const { appointment, updateAppointment } = useBooking();
  const navigate = useNavigate();

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Jeśli pole jest typu number (np. group_pax), konwertujemy string na liczbę
    const parsedValue = type === 'number' ? Number(value) : value;

    updateAppointment({ [name]: parsedValue } as Partial<Appointment>);
  };

  return (<Card className="sticky lg:top-24 xshadow-lg">
      <CardHeader>
        <CardTitle>Twoja rezerwacja</CardTitle>
        {appointment.visit_date && <CardDescription className="inline-flex gap-1.5 items-center"><Clock size="16" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
        <CardAction>
          <Button size="lg" variant="secondary" onClick={() => navigate(-1)}><ArrowLeft data-icon="inline-start" /> Zmień</Button>
        </CardAction>
      </CardHeader>
      <CardContent>

        <FieldGroup className="gap-3">

          {service.lesson && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.lesson.name}</FieldTitle>
                <FieldDescription>
                  {service.lesson.duration && <span>{service.lesson.duration} min., </span>} {service.lesson.pax_max && <span>max {service.lesson.pax_max} osób</span>}
                </FieldDescription>
              </FieldContent>
              {service.lesson.price > 0 && <div className="normal-case text-sm">{service.lesson.price * 1} zł/os.</div>}
            </Field>
          </FieldLabel>}

          {/*service.admission && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.admission.name}</FieldTitle>
              </FieldContent>
              {service.admission.price > 0 && <div className="normal-case text-sm">{service.admission.price * 1} zł/os.</div>}
            </Field>
          </FieldLabel>*/}

          {service.guide && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.guide.name}</FieldTitle>
              </FieldContent>
              {service.guide.price > 0 && <div className="normal-case text-sm">{service.guide.price * 1} zł/os.</div>}
            </Field>
          </FieldLabel>}

          {kulturalna_szkola === 1 && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">Chcę skorzystać z programu “Kulturalna Szkoła na Mazowszu”</FieldTitle>
                <FieldDescription>
                  <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank">Zasady uczestnictwa w programie</a>
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>}

        </FieldGroup>

        <div className="my-8 flex gap-8 lg:gap-16">
          <Label htmlFor="email">Liczba uczestników</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" size="lg"><Minus /></Button>
            <Input className="h-11" />
            <Button variant="secondary" size="lg"><Plus /></Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between text-lg font-semibold">
          <div className="uppercase">Razem</div>
          <div className="flex gap-4">
            <div className="line-through text-muted-foreground">180 zł</div>
            <div>20 zł</div>
          </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button onClick={nextHandler} size="lg" className="w-full">Dalej <ArrowRight data-icon="inline-end" /></Button>
      </CardFooter>
    </Card>)
}

export default Calculation