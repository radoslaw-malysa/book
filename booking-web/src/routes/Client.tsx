import Calculation from "@/components/Calculation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const AgeGroups = [
  { id: 1, title: 'przedszkole' },
  { id: 2, title: 'klasa 0-I' },
  { id: 3, title: 'klasa II-III' },
  { id: 4, title: 'klasa IV-VI' },
  { id: 5, title: 'klasa VII-VIII' },
  { id: 6, title: 'ponadpodstawowa' },
  { id: 7, title: 'dorośli' },
];

const Client = () => {
  return (<>
    <section>
      <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Card className="ring-0 shadow-none">
            <CardHeader>
              <CardTitle>Twoje dane</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-7">
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

                <Field>
                  <FieldLabel htmlFor="name">Telefon do szkoły</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">E-mail szkoły</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Osoba do kontaktu</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Telefon - kontakt</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">E-mail - kontakt</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Liczba opiekunów</FieldLabel>
                  <Input id="name" autoComplete="off" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Uwagi, szczególne wymagania, potrzeby</FieldLabel>
                  <Textarea id="name" autoComplete="off" />
                </Field>

              </FieldGroup>

              <div className="font-heading text-lg font-semibold tracking-wider uppercase mt-12 mb-8">Grupa wiekowa uczestników</div>

              <FieldGroup className="gap-3">
                {AgeGroups.map((age) => (<Field key={age.id} orientation="horizontal">
                  <Checkbox
                    id={`age_${age.id}`}
                  />
                  <FieldLabel
                    htmlFor={`age_${age.id}`}
                    className="cursor-pointer"
                  >
                    {age.title}
                  </FieldLabel>
                </Field>))}
              </FieldGroup>

              <div className="font-heading text-lg font-semibold tracking-wider uppercase mt-12 mb-8">Twoje zgody</div>

              <FieldGroup className="gap-4">
                <Field orientation="horizontal" className="items-start">
                  <Checkbox
                    id="consent_data"
                  />
                  <FieldLabel
                    htmlFor="consent_data"
                  >
                    <span>Zgadzam się na przetwarzanie moich danych przez Mazowieckie Centrum Sztuki Współczesnej „Elektrownia” w Radomiu, z siedzibą: 26-600 Radom, ul. Mikołaja Kopernika 1, w celu przeprowadzenia rezerwacji. <a href="https://www.mcswelektrownia.pl/pl/polityka-prywatnosci/14819" target="_blank" className="font-semibold underline">Polityka Prywatności</a></span>
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal" className="items-start">
                  <Checkbox
                    id="consent_lesson"
                  />
                  <FieldLabel
                    htmlFor="consent_lesson"
                  >
                    <span>Zapoznałam(em) się z treścią i akceptuję zasady <a href="https://www.mcswelektrownia.pl/pl/regulamin-warsztatow-edukacyjnych/14450" target="_blank" className="font-semibold underline">Regulaminu warsztatów edukacyjnych</a></span>
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal" className="items-start">
                  <Checkbox
                    id="consent_ks"
                  />
                  <FieldLabel
                    htmlFor="consent_ks"
                  >
                    <span>Zapoznałam(em) się z treścią i akceptuję <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank" className="font-semibold underline">Zasady uczestnictwa w programie "Kulturalna Szkoła na Mazowszu"</a></span>
                  </FieldLabel>
                </Field>
              </FieldGroup>


            </CardContent>
          </Card>
        </div>
        <div>
          <Calculation />
        </div>
      </div>
    </section>
  </>)
}

export default Client