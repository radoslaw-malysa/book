import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "./ui/field"
import { ArrowLeft, ArrowRight, Clock, Minus, Plus } from "lucide-react"
import { useBooking } from "@/context/BookingContext"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import OtpInput from "./OtpInput"
import { toast } from "./ui/toast"

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

  // min pax
  const minPax = 5;

  // max pax
  const maxList = [50];
  if (appointment.lesson && appointment.lesson.pax_max > 0) { maxList.push(appointment.lesson.pax_max) }
  if (appointment.guide && appointment.guide.pax_max > 0) { maxList.push(appointment.guide.pax_max) }
  const maxPax = Math.min(...maxList);

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

  // next enabled
  let error = '';
  if (!appointment.visit_date) { error = 'Wybierz datę wizyty'; }
  else if (!appointment.visit_time) { error = 'Wybierz godzinę wizyty'; }
  else if (!appointment.lesson && !appointment.guide) { error = 'Co chcesz zarezerwować? Wybierz coś z oferty.'; }
  else if (appointment.pax > maxPax) { error = `Grupa może liczyć maksymalnie ${maxPax} osób.`; }
  else if (appointment.pax < minPax) { error = `Grupa może liczyć minimalnie ${minPax} osób.`; }

  const handleShowError = () => {
    toast.add({
      type: "error",
      title: error
    })
  }

  return (<Card className="sticky lg:top-24 xshadow-lg">
      <CardHeader>
        <CardTitle>Twoja rezerwacja</CardTitle>
        {appointment.visit_date && <CardDescription className="inline-flex gap-1.5 items-center"><Clock size="16" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
        {false && <CardAction>
          <Button size="lg" variant="secondary" onClick={() => navigate(-1)}><ArrowLeft data-icon="inline-start" /> Zmień</Button>
        </CardAction>}
      </CardHeader>
      <CardContent>

        <FieldGroup className="gap-3">

          {service.lesson && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="lesson" name="lesson" checked={appointment.lesson !== null} onCheckedChange={(checked) => updateAppointment({ lesson: checked ? service.lesson : null }) } />
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
              <Checkbox id="guide" name="guide" checked={appointment.guide !== null} onCheckedChange={(checked) => updateAppointment({ guide: checked ? service.guide : null }) } />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.guide.name}</FieldTitle>
              </FieldContent>
              {service.guide.price > 0 && <div className="normal-case text-sm">{service.guide.price * 1} zł/os.</div>}
            </Field>
          </FieldLabel>}

          {kulturalna_szkola === 1 && <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="kulturalna_szkola" name="kulturalna_szkola" checked={appointment.kulturalna_szkola === 1} onCheckedChange={(checked) => updateAppointment({ kulturalna_szkola: checked ? 1 : null }) } />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">Chcę skorzystać z programu “Kulturalna Szkoła na Mazowszu”</FieldTitle>
                {appointment.kulturalna_szkola === 1 && <div>
                  <div>
                    <OtpInput onComplete={() => console.log('ok')} />
                  </div>
                  <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank">Zasady uczestnictwa w programie</a>
                </div>}
              </FieldContent>
            </Field>
          </FieldLabel>}

        </FieldGroup>

        <div className="my-8 grid grid-cols-2 gap-2 lg:gap-16">
          <Label htmlFor="pax">Liczba uczestników</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" size="lg" onClick={() => updateAppointment({pax: appointment.pax > minPax ? appointment.pax - 1 : minPax})}><Minus /></Button>
            <Input id="pax" name="pax" type="number" min={minPax} max={maxPax} className="h-11 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" value={appointment.pax} onChange={handleAppointmentChange} />
            <Button variant="secondary" size="lg" onClick={() => updateAppointment({pax: appointment.pax < maxPax ? appointment.pax + 1 : appointment.pax})}><Plus /></Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between text-lg font-semibold">
          <div className="uppercase">Razem</div>
          {appointment.kulturalna_szkola === 1 && <div className="flex gap-4">
            <div className="line-through text-muted-foreground">{totalPrice} zł</div>
            <div>{sellPrice} zł</div>
          </div>}
          {appointment.kulturalna_szkola !== 1 && <div className="flex gap-4">
            <div>{totalPrice} zł</div>
          </div>}
        </div>

      </CardContent>
      <CardFooter>
        {error !== '' && <Button onClick={handleShowError} size="lg" className="w-full bg-neutral-600">Dalej <ArrowRight data-icon="inline-end" /></Button>}
        {error === '' && <Button onClick={nextHandler} size="lg" className="w-full">Dalej <ArrowRight data-icon="inline-end" /></Button>}
      </CardFooter>
    </Card>)
}

export default Calculation

//https://codepen.io/cruip/pen/VwRdJpZ
//https://codepen.io/johnhoulder/pen/VOKJPo