import Calculation from "@/components/Calculation"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const Client = () => {
  return (<>
    <section>
      <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <FieldGroup>
            <RadioGroup defaultValue="plus">
              <FieldLabel htmlFor="plus-plan">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Szkoła podstawowa</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value="plus" id="plus-plan" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="pro-plan">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Szkoła ponadpodstawowa</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value="pro" id="pro-plan" />
                </Field>
              </FieldLabel>
            </RadioGroup>

            <Field>
              <FieldLabel htmlFor="name">Nazwa szkoły</FieldLabel>
              <Input id="name" autoComplete="off" />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Ulica</FieldLabel>
              <Input id="name" autoComplete="off" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Kod pocztowy</FieldLabel>
                <Input id="name" autoComplete="off" />
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="name">Miejscowość</FieldLabel>
                <Input id="name" autoComplete="off" />
              </Field>
            </div>
          </FieldGroup>
        </div>
        <div>
          <Calculation />
        </div>
      </div>
    </section>
  </>)
}

export default Client