import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "./ui/field"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { useBooking } from "@/context/BookingContext"

interface CalculationProps {
  nextHandler: () => void
}

const Calculation = ({nextHandler}: CalculationProps) => {
  const { appointment, updateAppointment } = useBooking();
  const navigate = useNavigate();

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Jeśli pole jest typu number (np. group_pax), konwertujemy string na liczbę
    const parsedValue = type === 'number' ? Number(value) : value;

    updateAppointment({ [name]: parsedValue } as Partial<Appointment>);
  };

  return (<Card className="sticky lg:top-24">
      <CardHeader>
        <CardTitle>Twoja rezerwacja</CardTitle>
        {appointment.visit_date && <CardDescription className="inline-flex gap-1.5 items-center"><Clock size="16" /><span> {appointment.visit_date}</span> {appointment.visit_time && <span>{appointment.visit_time}</span>}</CardDescription>}
        <CardAction>
          <Button size="lg" variant="secondary" onClick={() => navigate(-1)}><ArrowLeft data-icon="inline-start" /> Zmień</Button>
        </CardAction>
      </CardHeader>
      <CardContent>

        <FieldGroup className="gap-4">

          <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle>Warsztaty sensoryczno-plastyczne “Bajki z pieca”</FieldTitle>
                <FieldDescription>
                  60 min., max 25 osób
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle>Wstęp na wystawy</FieldTitle>
                <FieldDescription>
                  60 min., max 50 osób
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle>Zwiedzanie z przewodnikiem</FieldTitle>
                <FieldDescription>
                  60 min., max 50 osób
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel>
            <Field orientation="horizontal">
              <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
              <FieldContent>
                <FieldTitle>Chcę skorzystać z programu Kulturalna Szkoła na Mazowszu</FieldTitle>
                <FieldDescription>
                  Zasady uczestnictwa w programie
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <Button onClick={nextHandler} size="lg">Dalej <ArrowRight data-icon="inline-end" /></Button>

        </FieldGroup>

      </CardContent>
    </Card>)
}

export default Calculation