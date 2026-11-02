import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "./ui/field"
import { ArrowLeft, ArrowRight, Clock, Minus, Plus, RotateCcw, Users } from "lucide-react"
import { useBooking, type Appointment, type Client } from "@/context/BookingContext"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { toast } from "./ui/toast"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp"
import { Item, ItemContent, ItemMedia, ItemTitle } from "./ui/item"
import { useState } from "react"
import { getZipValidation } from "@/services/booking"

interface CalculationProps {
  service: {};
  kulturalna_szkola: number;
  kultura_za_zl: number;
  nextHandler: () => void;
  is_trip_available: boolean;
}

const Calculation = ({service, kulturalna_szkola, kultura_za_zl, nextHandler, is_trip_available}: CalculationProps) => {
  const { appointment, updateAppointment, updateClient } = useBooking();
  const navigate = useNavigate();
  const [zip, setZip] = useState(appointment.zip_valid.replace(/\D/g, ''));
  const [zipInvalid, setZipInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Jeśli pole jest typu number (np. group_pax), konwertujemy string na liczbę
    const parsedValue = type === 'number' ? Number(value) : value;

    updateAppointment({ [name]: parsedValue } as Partial<Appointment>);
  };

  const handleZipComplete = async (zip: string) => {
    setLoading(true);
    const response = await getZipValidation(zip);
    setLoading(false);
    if (response.allowed === 1 && response.zip) {
      updateAppointment({ zip_valid: response.zip } as Partial<Appointment>);
      updateClient({ zip: response.zip } as Partial<Client>);
      setZipInvalid(false);
    } else {
      updateAppointment({ zip_valid: '' } as Partial<Appointment>);
      setZipInvalid(true);
    }
  }

  const handleZipReset = () => {
    updateAppointment({ zip_valid: '' } as Partial<Appointment>);
    updateClient({ zip: '' } as Partial<Client>);
    setZip('');
    setZipInvalid(false);
  }

  const handleShowError = () => {
    toast.add({
      type: "error",
      title: error
    })
  }

  // min pax
  const minList = [];
  if (appointment.lesson && appointment.lesson.pax_min > 0) { minList.push(appointment.lesson.pax_min) }
  if (appointment.guide && appointment.guide.pax_min > 0) { minList.push(appointment.guide.pax_min) }
  const minPax = Math.max(...minList);

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
  if ((appointment.kulturalna_szkola === 1 || appointment.kultura_za_zl === 1) && appointment.zip_valid) {
    sellPrice = appointment.pax * 1;
  } else {
    sellPrice = totalPrice;
  }

  // next enabled
  let error = '';
  let paxError = '';
  if (!appointment.visit_date) { error = 'Wybierz datę wizyty'; }
  else if (!appointment.visit_time) { error = 'Wybierz godzinę wizyty'; }
  else if (!appointment.lesson && !appointment.guide) { error = 'Co chcesz zarezerwować? Wybierz coś z oferty.'; }
  else if (appointment.pax > maxPax) { error = `Grupa może liczyć maksymalnie ${maxPax} osób.`; paxError = `Maksymalnie ${maxPax} osób`; }
  else if (appointment.pax < minPax) { error = `Grupa może liczyć minimalnie ${minPax} osób.`; paxError = `Minimum ${minPax} osób`; }

  return (<Card className="sticky lg:top-24 xshadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Twoja rezerwacja</CardTitle>
        {appointment.visit_date && <CardDescription className="inline-flex gap-2 items-center"><Clock size="18" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
        {false && <CardAction>
          <Button size="lg" variant="secondary" onClick={() => navigate(-1)}><ArrowLeft data-icon="inline-start" /> Zmień</Button>
        </CardAction>}
      </CardHeader>
      <CardContent>

        <FieldGroup className="gap-3">

          {service.lesson && <FieldLabel>
            <Field orientation="horizontal" className="cursor-pointer">
              <Checkbox id="lesson" name="lesson" checked={appointment.lesson !== null} onCheckedChange={(checked) => updateAppointment({ lesson: checked ? service.lesson : null }) } />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.lesson.name}</FieldTitle>
                <FieldDescription>
                  {service.lesson.duration && <span>{service.lesson.duration} min., </span>} {service.lesson.pax_max && <span>{service.lesson.pax_min}-{service.lesson.pax_max} osób</span>}
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

          {service.guide && <FieldLabel className="cursor-pointer">
            <Field orientation="horizontal">
              <Checkbox id="guide" name="guide" checked={appointment.guide !== null} onCheckedChange={(checked) => updateAppointment({ guide: checked ? service.guide : null })} disabled={!is_trip_available} />
              <FieldContent>
                <FieldTitle className="normal-case text-sm">{service.guide.name}</FieldTitle>
                {is_trip_available && <FieldDescription>
                  {service.guide.duration && <span>{service.guide.duration} min., </span>} {service.guide.pax_max && <span>{service.guide.pax_min}-{service.guide.pax_max} osób</span>}
                </FieldDescription>}
                {!is_trip_available && <FieldDescription className="leading-[1.25] text-destructive">Wystawy niedostępne w wybranej godzinie.</FieldDescription>}
              </FieldContent>
              {service.guide.price > 0 && <div className="normal-case text-sm">{service.guide.price * 1} zł/os.</div>}
            </Field>
          </FieldLabel>}

          {kulturalna_szkola === 1 && <Item variant="outline" className="has-data-checked:bg-input/30 items-start">
            <ItemMedia>
              <Checkbox
                id="kulturalna_szkola"
                name="kulturalna_szkola"
                checked={appointment.kulturalna_szkola === 1} onCheckedChange={(checked) => updateAppointment({ kulturalna_szkola: checked ? 1 : 0, kultura_za_zl: 0 }) }
                className="cursor-pointer"
              />
            </ItemMedia>
            <ItemContent className="gap-2">
              <ItemTitle><label htmlFor="kulturalna_szkola" className="cursor-pointer hover:opacity-60">Chcę skorzystać z programu “Kulturalna Szkoła na Mazowszu”</label></ItemTitle>
              {appointment.kulturalna_szkola === 1 && <Field className="py-2 flex justify-center">
                <div className="inline-flex flex-col gap-3">
                  <FieldLabel htmlFor="otp-verification" className="text-muted-foreground">
                    Podaj kod pocztowy szkoły:
                  </FieldLabel>
                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 lg:items-center">
                    <div className="inline-flex gap-1 items-center">
                      <InputOTP maxLength={5} id="otp-verification" value={zip} onChange={setZip} onComplete={handleZipComplete}>
                        <InputOTPGroup className={`*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl ${appointment.zip_valid ? 'ring-3 ring-green-500/40' : ''}`}>
                          <InputOTPSlot index={0} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={1} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="mx-2" />
                        <InputOTPGroup className={`*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl ${appointment.zip_valid ? 'ring-3 ring-green-500/40' : ''}`}>
                          <InputOTPSlot index={2} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={3} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={4} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button variant="ghost" size="icon-lg" aria-label="Wyczyść kod pocztowy" title="Wyczyść kod pocztowy" onClick={handleZipReset}><RotateCcw /></Button>
                    </div>

                    {loading && <div className="text-muted-foreground flex-grow lg:text-center">Sprawdzam...</div>}
                    {zipInvalid && <div className="text-destructive flex-grow lg:text-center">Nie znaleziono kodu w mazowieckim</div>}
                    {appointment.zip_valid && <div className="text-green-600 flex-grow lg:text-center">Kod prawidłowy</div>}
                  </div>
                  <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank" className="text-muted-foreground hover:text-foreground underline mt-1.5">Zasady uczestnictwa w programie</a>
                </div>
              </Field>}
            </ItemContent>
          </Item>}

          {kultura_za_zl === 1 && <Item variant="outline" className="has-data-checked:bg-input/30 items-start">
            <ItemMedia>
              <Checkbox
                id="kultura_za_zl"
                name="kultura_za_zl"
                checked={appointment.kultura_za_zl === 1} onCheckedChange={(checked) => updateAppointment({ kultura_za_zl: checked ? 1 : 0, kulturalna_szkola: 0 }) }
                className="cursor-pointer"
              />
            </ItemMedia>
            <ItemContent className="gap-2">
              <ItemTitle><label htmlFor="kultura_za_zl" className="cursor-pointer hover:opacity-60">Chcę skorzystać z programu “Kultura za 1 zł” <br />wsparcie osób z niepełnosprawnościami na Mazowszu</label></ItemTitle>
              {appointment.kultura_za_zl === 1 && <Field className="py-2">
                <div className="inline-flex flex-col gap-3">
                  <FieldLabel htmlFor="otp-verification" className="text-muted-foreground">
                    Podaj kod pocztowy szkoły:
                  </FieldLabel>
                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 lg:items-center">
                    <div className="inline-flex gap-1 items-center">
                      <InputOTP maxLength={5} id="otp-verification" value={zip} onChange={setZip} onComplete={handleZipComplete}>
                        <InputOTPGroup className={`*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl ${appointment.zip_valid ? 'ring-3 ring-green-500/40' : ''}`}>
                          <InputOTPSlot index={0} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={1} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="mx-2" />
                        <InputOTPGroup className={`*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl ${appointment.zip_valid ? 'ring-3 ring-green-500/40' : ''}`}>
                          <InputOTPSlot index={2} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={3} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                          <InputOTPSlot index={4} aria-invalid={zipInvalid} className="bg-white border-neutral-400" />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button variant="ghost" size="icon-lg" aria-label="Wyczyść kod pocztowy" title="Wyczyść kod pocztowy" onClick={handleZipReset}><RotateCcw /></Button>
                    </div>

                    {loading && <div className="text-muted-foreground flex-grow lg:text-center">Sprawdzam...</div>}
                    {zipInvalid && <div className="text-destructive flex-grow lg:text-center">Nie znaleziono kodu w mazowieckim</div>}
                    {appointment.zip_valid && <div className="text-green-600 flex-grow lg:text-center">Kod prawidłowy</div>}
                  </div>
                  <a href="https://www.mcswelektrownia.pl/pl/kultura-za-zlotowke-dla-osob-z-niepelnosprawnosciami/14452" target="_blank" className="text-muted-foreground hover:text-foreground underline mt-1.5">Zasady uczestnictwa w programie</a>
                </div>
              </Field>}
            </ItemContent>
          </Item>}

        </FieldGroup>

        <div className="my-8 grid grid-cols-2 gap-2 lg:gap-16">
          <Label htmlFor="pax" className="inline-flex gap-2 items-center"><Users size="18" /> Liczba uczestników</Label>
          <div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => updateAppointment({pax: appointment.pax > minPax ? appointment.pax - 1 : minPax})}><Minus /></Button>
              <Input id="pax" name="pax" type="number" min={minPax} max={maxPax} aria-invalid={paxError !== ''} className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" value={appointment.pax} onChange={handleAppointmentChange} />
              <Button variant="secondary" size="icon" onClick={() => updateAppointment({pax: appointment.pax < maxPax ? appointment.pax + 1 : appointment.pax})}><Plus /></Button>
            </div>
            {paxError !== '' && <div className="text-destructive text-center pt-2">{paxError}</div>}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between text-lg font-semibold">
          <div className="uppercase">Razem</div>
          {(totalPrice !== sellPrice) && <div className="flex gap-4">
            <div className="line-through text-muted-foreground">{totalPrice} zł</div>
            <div>{sellPrice} zł</div>
          </div>}
          {(totalPrice === sellPrice) && <div className="flex gap-4">
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