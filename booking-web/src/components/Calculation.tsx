import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "./ui/field"

const Calculation = () => {
  let navigate = useNavigate();
  const nextHandler = () => {
    navigate("/rezerwacja/dane");
  }

  return (<Card className="sticky lg:top-24">
      <CardHeader>
        <CardTitle>Twoja rezerwacja</CardTitle>
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

          <Button onClick={nextHandler}>Dalej</Button>

        </FieldGroup>

      </CardContent>
    </Card>)
}

export default Calculation