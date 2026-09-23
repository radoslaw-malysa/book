import { getAppointment, updateAppointment, type Appointment } from "@/api/appointments";
import type { Service } from "@/api/services";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Sheet, SheetContent,  SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Printer } from "lucide-react";
import { useEffect, useState } from "react";

interface ItemEditDialogProps {
  itemId: number | null;
  refreshKey: string;
  onClose: () => void;
}

const states = [
  { label: 'Niepotwierdzona', value: 'pending' },
  { label: 'Potwierdzona', value: 'confirmed' },
  { label: 'Anulowana', value: 'cancelled' }
];

const stateColors = {
  pending: 'bg-amber-500', 
  confirmed: 'bg-emerald-500', 
  cancelled: 'bg-red-500'
};

const customerTypes = [
  { value: 'primary', label: 'Szkoła podstawowa' },
  { value: 'post_primary', label: 'Szkoła ponadpodstawowa' },
  { value: 'individual', label: 'Indywidualny' },
  { value: 'organized_group', label: 'Grupa' },
  { value: 'other', label: 'Inny' }
];

const AppointmentEdit = ({ itemId, refreshKey, onClose }: ItemEditDialogProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Appointment | null>(null);

  const itemQuery = useQuery({
    queryKey: ["appointment", itemId],
    queryFn: () => getAppointment(itemId),
    enabled: itemId !== null,
  });
  // as number
  const updateMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: (resp) => {
      if (resp.message) {
        toast.add({
          type: "error",
          title: "Błąd!",
          description: resp.message
        })
      } else {
        queryClient.invalidateQueries({ queryKey: [refreshKey] });
        onClose();
      }
    },
  });

  useEffect(() => {
    if (itemQuery.data) {
      setForm(itemQuery.data);
    }
  }, [itemQuery.data]);

  const updateField = (field: string, value: string | number | boolean) => {
    if (typeof value === 'boolean') { value = value ? 1 : 0 }
    console.log(field + '/' + value)

    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateProvider = (index: number, field: string, value: number | string) => {
    const newState = form?.appointment_providers;
    if (newState) {
      newState[index][field] = value;
      setForm((current) => (current ? { ...current, appointment_providers: newState } : current));
    }
  };

  const updateCustomer = (field: string, value: number | string) => {
    const newState = form?.customer;
    if (newState) {
      newState[field] = value;
      setForm((current) => (current ? { ...current, customer: newState } : current));
    }
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };
  
  const submitFormHandler = () => {
    updateMutation.mutate(form);
  }
  
  return (
    <Sheet 
      open={itemId !== null}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      {form && <SheetContent className="rounded-l-2xl">
        <SheetHeader className="h-head border-b">
          <SheetTitle className="flex gap-2 items-center leading-none"><div className={`size-3 rounded-full ${stateColors[form.state]}`}></div> Rezerwacja {form.id ? 'nr ' + form.id : 'NOWA'}</SheetTitle>
        </SheetHeader>
        
        <div className="h-side no-scrollbar overflow-y-auto">
        <form onSubmit={(event) => {
          event.preventDefault();
          updateMutation.mutate(form);
        }}
        >
          

          <Tabs defaultValue="overview" className="w-full gap-6 pb-6">
            <TabsList variant="default" className="w-full border-b px-6 rounded-none">
              <TabsTrigger value="overview" className="cursor-pointer">Rezerwacja</TabsTrigger>
              <TabsTrigger value="contact" className="cursor-pointer">Kontakt</TabsTrigger>
              <TabsTrigger value="prices" className="cursor-pointer">Rozliczenie</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="px-6">


            <div className="grid gap-6">
              <Field className="gap-2">
                <FieldLabel htmlFor="pax" className="hidden">Liczba uczestników</FieldLabel>
                <InputGroup>
                    <InputGroupInput 
                      type="number"
                      id="pax"
                      name="pax"
                      placeholder="Liczba uczestników"
                      value={form.pax}
                      onChange={(event) => updateField('pax', event.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      osób
                    </InputGroupAddon>
                  </InputGroup>
              </Field>
              <FieldGroup className="gap-2">
                <Field orientation="horizontal">
                  <Checkbox 
                    id="kulturalna_szkola" 
                    value="1" 
                    name="kulturalna_szkola" 
                    checked={form.kulturalna_szkola == 1}
                    onCheckedChange={(val) => updateField('kulturalna_szkola', val)}
                  />
                  <FieldLabel htmlFor="kulturalna_szkola">Kulturalna Szkoła na Mazowszu</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox 
                    id="kultura_za_zl" 
                    value="1" 
                    name="kultura_za_zl" 
                    checked={form.kultura_za_zl == 1}
                    onCheckedChange={(val) => updateField('kultura_za_zl', val)}
                  />
                  <FieldLabel htmlFor="kultura_za_zl">Kultura za zł (wsparcie osób z niepełnospr.)</FieldLabel>
                </Field>
              </FieldGroup>
            </div>


              <div className="grid flex-1 auto-rows-min gap-6">
                

                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Uwagi</FieldLabel>
                  <Textarea 
                    id="notes"
                    value={form.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="state">Status</FieldLabel>
                  <NativeSelect id="state" className="w-full" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                    <NativeSelectOption value=""></NativeSelectOption>
                    {states.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                  </NativeSelect>
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <FieldGroup className="gap-3 mb-6">
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Dane klienta</FieldLabel>
                  <Input 
                    name="name"
                    placeholder="Nazwa"
                    value={form.customer.name}
                    onChange={(e) => updateCustomer('name', e.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <NativeSelect className="w-full" value={form.customer.customer_type} onChange={(e) => updateCustomer('customer_type', e.target.value)}>
                    <NativeSelectOption value="">Wybierz typ klienta</NativeSelectOption>
                    {customerTypes.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                  </NativeSelect>
                </Field>
                <Field className="gap-2">
                  <Input 
                    name="address"
                    placeholder="Ulica, nr domu, kod pocztowy, miasto"
                    value={form.customer.address}
                    onChange={(e) => updateCustomer('address', e.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    name="phone"
                    placeholder="Telefon"
                    value={form.customer.phone}
                    onChange={(e) => updateCustomer('phone', e.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={form.customer.email}
                    onChange={(e) => updateCustomer('email', e.target.value)}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup className="gap-3 mb-6">
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Osoba do kontaktu</FieldLabel>
                  <Input 
                    name="contact_name"
                    value={form.customer.contact_name}
                    onChange={(e) => updateCustomer('contact_name', e.target.value)}
                    placeholder="Imię i nazwisko"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    name="contact_phone"
                    value={form.customer.contact_phone}
                    onChange={(e) => updateCustomer('contact_phone', e.target.value)}
                    placeholder="Telefon"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    name="contact_email"
                    value={form.customer.contact_email}
                    onChange={(e) => updateCustomer('contact_email', e.target.value)}
                    placeholder="E-mail"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup className="gap-3 mb-6">
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Ilość opiekunów</FieldLabel>
                  <Input 
                    name="pax_care"
                    value={form.customer.pax_care}
                    onChange={(e) => updateCustomer('pax_care', e.target.value)}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup className="gap-2 mb-6">
                <Field orientation="horizontal">
                  <Checkbox 
                    id="accept_processing" 
                    value="1" 
                    name="accept_processing" 
                    checked={form.customer.accept_processing == 1}
                    onCheckedChange={(val) => updateCustomer('accept_processing', (val) ? 1 : 0)}
                  />
                  <FieldLabel htmlFor="accept_processing">Zgoda na przetwarznie danych</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox 
                    id="accept_regulations" 
                    value="1" 
                    name="accept_regulations" 
                    checked={form.customer.accept_regulations == 1}
                    onCheckedChange={(val) => updateCustomer('accept_regulations', (val) ? 1 : 0)}
                  />
                  <FieldLabel htmlFor="accept_processing">Akceptacja Regulaminu</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox 
                    id="accept_kultura_zl" 
                    value="1" 
                    name="accept_kultura_zl" 
                    checked={form.customer.accept_kultura_zl == 1}
                    onCheckedChange={(val) => updateCustomer('accept_kultura_zl', (val) ? 1 : 0)}
                  />
                  <FieldLabel htmlFor="accept_kultura_zl">Akceptacja regulaminu Kultura za zł.</FieldLabel>
                </Field>
              </FieldGroup>
              <FieldGroup className="gap-2">
                <Button variant="outline"><Printer data-icon="inline-start" /> Wniosek Kultura za zł</Button>
                <Button variant="outline"><Mail data-icon="inline-start" /> Poinformuj o rezerwacji</Button>
              </FieldGroup>

            </TabsContent>

            <TabsContent value="prices">
              <div className="mb-6 text-center">[ - - - Kalkulacja ceny - - - ]</div>

              <FieldGroup className="gap-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="pax">Cena z cennika</FieldLabel>
                  <InputGroup>
                      <InputGroupInput 
                        type="number"
                        id="total_price"
                        name="total_price"
                        value={form.total_price}
                        onChange={(event) => updateField('total_price', event.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        zł
                      </InputGroupAddon>
                    </InputGroup>
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="pax">Cena sprzedaży</FieldLabel>
                  <InputGroup>
                      <InputGroupInput 
                        type="number"
                        id="sell_price"
                        name="sell_price"
                        value={form.sell_price}
                        onChange={(e) => updateField('sell_price', e.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        zł
                      </InputGroupAddon>
                    </InputGroup>
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Nr dokumentu sprzedaży</FieldLabel>
                  <Input 
                    name="sell_doc"
                    value={form.sell_doc}
                    onChange={(e) => updateField('sell_doc', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
          </Tabs>
        </form>
        </div>
        <SheetFooter className="h-foot border-t">
          <Button type="button" onClick={submitFormHandler} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}</Button>
          {/*<SheetClose render={<Button variant="outline" type="button">Zamknij</Button>} />*/}
        </SheetFooter>
        
      </SheetContent>}
    </Sheet>
  )
}

export default AppointmentEdit