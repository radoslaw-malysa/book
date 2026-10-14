import Calculation from "@/components/Calculation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useBooking } from "@/context/BookingContext"
import { useState } from "react"
import { useNavigate } from "react-router"

const AgeGroups = [
  { id: 'age_1', title: 'przedszkole' },
  { id: 'age_2', title: 'klasa 0-I' },
  { id: 'age_3', title: 'klasa II-III' },
  { id: 'age_4', title: 'klasa IV-VI' },
  { id: 'age_5', title: 'klasa VII-VIII' },
  { id: 'age_6', title: 'ponadpodstawowa' },
  { id: 'age_7', title: 'dorośli' },
];
  
const initialErrors = {
  customer_type: false,
  name: false,
  address: false,
  zip: false,
  city: false,
  phone: false,
  email: false,
  contact_name: false,
  contact_phone: false,
  contact_email: false,
  pax_care: false,
  accept_processing: false,
  accept_regulations: false,
  accept_kultura_zl: false
}

const Client = () => {
  const { client, updateClient } = useBooking();
  let navigate = useNavigate();
  const [errors, setErrors] = useState(initialErrors)

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    /*if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked ? 1 : 0;
      updateClient({ [name]: checked } as Partial<Client>);
      return;
    }*/

    // Standardowa aktualizacja dla stringów (text, email, tel, itp.)
    updateClient({ [name]: value } as Partial<Client>);

    // validacja
    if (!value && !errors[name]) {
      setErrors((prev) => { return {...prev, [name]: true}});
    } else if (value && errors[name]) {
      setErrors((prev) => { return {...prev, [name]: false}})
    }
  };

  const handleClientCheck = (name: String, checked: Boolean) => {
    const value = checked ? 1 : 0;
    updateClient({ [name]: value } as Partial<Client>);

    // validacja
    if (!value && !errors[name]) {
      setErrors((prev) => { return {...prev, [name]: true}});
    } else if (value && errors[name]) {
      setErrors((prev) => { return {...prev, [name]: false}})
    }
  }

  const handleClientRadio = (name: String, value: Boolean) => {
    updateClient({ [name]: value } as Partial<Client>);

    // validacja
    if (!value && !errors[name]) {
      setErrors((prev) => { return {...prev, [name]: true}});
    } else if (value && errors[name]) {
      setErrors((prev) => { return {...prev, [name]: false}})
    }
  }

  const validateForm = (): boolean => {
    const newErrors = errors;
    let errorsCount = 0;

    newErrors.customer_type = !client.customer_type;
    newErrors.name = !client.name;
    newErrors.address = !client.address;
    newErrors.zip = !client.zip;
    newErrors.city = !client.city;
    newErrors.phone = !client.phone;
    newErrors.email = !client.email;
    newErrors.contact_name = !client.contact_name;
    newErrors.contact_phone = !client.contact_phone;
    newErrors.contact_email = !client.contact_email;
    newErrors.pax_care = !client.pax_care;
    newErrors.accept_processing = !client.accept_processing;
    newErrors.accept_regulations = !client.accept_regulations;
    newErrors.accept_kultura_zl = !client.accept_kultura_zl;


    //setErrors(newErrors);
    setErrors(() => { return {...newErrors}});

    const hasAnyError = Object.values(newErrors).includes(true);

    if (hasAnyError) {
      toast.add({
        type: "error",
        description: "Wypełnij wszystkie wymagane pola.",
      })
    }

    return (errorsCount === 0)
  }

  const nextHandler = () => {
    if (!validateForm()) {
      return;
    }

    navigate("/rezerwacja/dane");
  }

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
                <RadioGroup onValueChange={(value) => handleClientRadio('customer_type', value)} defaultValue={client.customer_type}>
                  <FieldLabel htmlFor="primary">
                    <Field orientation="horizontal" data-invalid={errors.customer_type}>
                      <FieldContent>
                        <FieldTitle>Szkoła podstawowa</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value="primary" id="primary" aria-invalid={errors.customer_type} />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="post_primary">
                    <Field orientation="horizontal" data-invalid={errors.customer_type}>
                      <FieldContent>
                        <FieldTitle>Szkoła ponadpodstawowa</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value="post_primary" id="post_primary" aria-invalid={errors.customer_type} />
                    </Field>
                  </FieldLabel>
                </RadioGroup>

                <Field data-invalid={errors.name}>
                  <FieldLabel htmlFor="name">Nazwa szkoły</FieldLabel>
                  <Input 
                    id="name"
                    name="name"
                    type="text"
                    value={client.name}
                    onChange={handleClientChange} 
                    aria-invalid={errors.name}
                    autoComplete="off" />
                  {errors.name && <FieldDescription className="text-destructive">Wypełnij nazwę szkoły</FieldDescription>}
                </Field>

                <Field data-invalid={errors.address}>
                  <FieldLabel htmlFor="address">Ulica, nr domu</FieldLabel>
                  <Input 
                    id="address" 
                    name="address"
                    type="text"
                    value={client.address}
                    onChange={handleClientChange}
                    aria-invalid={errors.address}
                    autoComplete="off" />
                  {errors.address && <FieldDescription className="text-destructive">Wypełnij ulicę i nr domu</FieldDescription>}
                </Field>

                <div className="grid grid-cols-3 gap-4">
                  <Field data-invalid={errors.zip}>
                    <FieldLabel htmlFor="zip">Kod pocztowy</FieldLabel>
                    <Input 
                      id="zip" 
                      name="zip"
                      type="text"
                      value={client.zip}
                      onChange={handleClientChange}
                      aria-invalid={errors.zip}
                      autoComplete="off" />
                    {errors.zip && <FieldDescription className="text-destructive">Wypełnij kod pocztowy</FieldDescription>}
                  </Field>
                  <Field data-invalid={errors.city} className="col-span-2">
                    <FieldLabel htmlFor="city">Miejscowość</FieldLabel>
                    <Input 
                      id="city" 
                      name="city"
                      type="text"
                      value={client.city}
                      onChange={handleClientChange}
                      aria-invalid={errors.city}
                      autoComplete="off" />
                    {errors.city && <FieldDescription className="text-destructive">Wypełnij miejscowość</FieldDescription>}
                  </Field>
                </div>

                <Field data-invalid={errors.phone}>
                  <FieldLabel htmlFor="phone">Telefon do szkoły</FieldLabel>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="text"
                    value={client.phone}
                    onChange={handleClientChange}
                    aria-invalid={errors.phone}
                    autoComplete="off" />
                  {errors.phone && <FieldDescription className="text-destructive">Wypełnij telefon do szkoły</FieldDescription>}
                </Field>

                <Field data-invalid={errors.email}>
                  <FieldLabel htmlFor="phone">E-mail szkoły</FieldLabel>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={client.email}
                    onChange={handleClientChange}
                    aria-invalid={errors.email}
                    autoComplete="off" />
                  {errors.email && <FieldDescription className="text-destructive">Wypełnij e-mail do szkoły</FieldDescription>}
                </Field>

                <Field data-invalid={errors.contact_name}>
                  <FieldLabel htmlFor="phone">Osoba do kontaktu</FieldLabel>
                  <Input 
                    id="contact_name" 
                    name="contact_name"
                    type="text"
                    value={client.contact_name}
                    onChange={handleClientChange}
                    aria-invalid={errors.contact_name}
                    autoComplete="off" />
                  {errors.contact_name && <FieldDescription className="text-destructive">Podaj imię i nazwisko osoby kontaktowej</FieldDescription>}
                </Field>

                <Field data-invalid={errors.contact_phone}>
                  <FieldLabel htmlFor="phone">Telefon do kontaktu</FieldLabel>
                  <Input 
                    id="contact_phone" 
                    name="contact_phone"
                    type="text"
                    value={client.contact_phone}
                    onChange={handleClientChange}
                    aria-invalid={errors.contact_phone}
                    autoComplete="off" />
                  {errors.contact_phone && <FieldDescription className="text-destructive">Wypełnij telefon do kontaktu</FieldDescription>}
                </Field>

                <Field data-invalid={errors.contact_email}>
                  <FieldLabel htmlFor="phone">E-mail do kontaktu</FieldLabel>
                  <Input 
                    id="contact_email" 
                    name="contact_email"
                    type="email"
                    value={client.contact_email}
                    onChange={handleClientChange}
                    aria-invalid={errors.contact_email}
                    autoComplete="off" />
                  {errors.contact_email && <FieldDescription className="text-destructive">Wypełnij e-mail do kontaktu</FieldDescription>}
                </Field>

                <Field data-invalid={errors.pax_care}>
                  <FieldLabel htmlFor="phone">Liczba opiekunów</FieldLabel>
                  <Input 
                    id="pax_care" 
                    name="pax_care"
                    type="number"
                    value={client.pax_care}
                    onChange={handleClientChange}
                    aria-invalid={errors.pax_care}
                    autoComplete="off" />
                  {errors.pax_care && <FieldDescription className="text-destructive">Podaj liczbę opiekunów</FieldDescription>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="notes">Uwagi, szczególne wymagania, potrzeby</FieldLabel>
                  <Textarea 
                    id="notes" 
                    name="notes"
                    value={client.notes}
                    onChange={handleClientChange}
                    autoComplete="off" />
                </Field>

              </FieldGroup>

              <div className="font-heading text-lg font-semibold tracking-wider uppercase mt-12 mb-8">Grupa wiekowa uczestników</div>

              <FieldGroup className="gap-3">
                {AgeGroups.map((age) => (<Field key={age.id} orientation="horizontal">
                  <Checkbox
                    id={age.id}
                    name={age.id}
                    checked={client[age.id] === 1}
                    onCheckedChange={(checked) => handleClientCheck(age.id, checked)}
                  />
                  <FieldLabel
                    htmlFor={age.id}
                    className="cursor-pointer"
                  >
                    {age.title}
                  </FieldLabel>
                </Field>))}
              </FieldGroup>

              <div className="font-heading text-lg font-semibold tracking-wider uppercase mt-12 mb-8">Twoje zgody</div>

              <FieldGroup className="gap-4">
                <Field orientation="horizontal" className="items-start" data-invalid={errors.accept_processing}>
                  <Checkbox
                    id="accept_processing"
                    name="accept_processing"
                    checked={client.accept_processing === 1}
                    onCheckedChange={(checked) => handleClientCheck('accept_processing', checked)}
                    aria-invalid={errors.accept_processing}
                  />
                  <FieldLabel
                    htmlFor="accept_processing"
                  >
                    <span>Zgadzam się na przetwarzanie moich danych przez Mazowieckie Centrum Sztuki Współczesnej „Elektrownia” w Radomiu, z siedzibą: 26-600 Radom, ul. Mikołaja Kopernika 1, w celu przeprowadzenia rezerwacji. <a href="https://www.mcswelektrownia.pl/pl/polityka-prywatnosci/14819" target="_blank" className="font-semibold underline">Polityka Prywatności</a></span>
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal" className="items-start" data-invalid={errors.accept_regulations}>
                  <Checkbox
                    id="accept_regulations"
                    name="accept_regulations"
                    checked={client.accept_regulations === 1}
                    onCheckedChange={(checked) => handleClientCheck('accept_regulations', checked)}
                    aria-invalid={errors.accept_regulations}
                  />
                  <FieldLabel
                    htmlFor="accept_regulations"
                  >
                    <span>Zapoznałam(em) się z treścią i akceptuję zasady <a href="https://www.mcswelektrownia.pl/pl/regulamin-warsztatow-edukacyjnych/14450" target="_blank" className="font-semibold underline">Regulaminu warsztatów edukacyjnych</a></span>
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal" className="items-start" data-invalid={errors.accept_kultura_zl}>
                  <Checkbox
                    id="accept_kultura_zl"
                    name="accept_kultura_zl"
                    checked={client.accept_kultura_zl === 1}
                    onCheckedChange={(checked) => handleClientCheck('accept_kultura_zl', checked)}
                    aria-invalid={errors.accept_kultura_zl}
                  />
                  <FieldLabel
                    htmlFor="accept_kultura_zl"
                  >
                    <span>Zapoznałam(em) się z treścią i akceptuję <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank" className="font-semibold underline">Zasady uczestnictwa w programie "Kulturalna Szkoła na Mazowszu"</a></span>
                  </FieldLabel>
                </Field>
              </FieldGroup>


            </CardContent>
          </Card>
        </div>
        <div>
          <Calculation nextHandler={nextHandler} />
        </div>
      </div>
    </section>
  </>)
}

export default Client