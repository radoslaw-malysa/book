import { getAppointment, updateAppointment, type Appointment } from "@/api/appointments";
import type { Service } from "@/api/services";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent,  SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface ItemEditDialogProps {
  itemId: number | null;
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

const AppointmentEdit = ({ itemId, onClose }: ItemEditDialogProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Appointment | null>(null);

  const itemQuery = useQuery({
    queryKey: ["appointment", itemId],
    queryFn: () => getAppointment(itemId as number),
    enabled: itemId !== null,
  });
  
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
        queryClient.invalidateQueries({ queryKey: ["calendar"] });
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
        <SheetHeader>
          <SheetTitle className="flex gap-2 items-center"><div className={`size-3 rounded-full ${stateColors[form.state]}`}></div> Rezerwacja {form.id ? 'nr ' + form.id : 'NOWA'}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={(event) => {
          event.preventDefault();
          updateMutation.mutate(form);
        }}
          className="grid gap-6"
        >
          <Separator />
          <div className="grid gap-6 px-6">
            <Field className="gap-2">
              <FieldLabel htmlFor="sheet-demo-name">Warsztaty</FieldLabel>
              <NativeSelect className="w-full" value={form.service_id} onChange={(e) => updateField('service_id', e.target.value)}>
                <NativeSelectOption value="">Bez warsztatów</NativeSelectOption>
                {form.services.map((s: Service) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
              </NativeSelect>
            </Field>
            <FieldGroup className="gap-2">
              <Field orientation="horizontal">
                <Checkbox 
                  id="admission" 
                  value="1" 
                  name="admission" 
                  checked={form.admission == 1}
                  onCheckedChange={(val) => updateField('admission', val)}
                 />
                <FieldLabel htmlFor="admission">Wstęp na wystawy</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox 
                  id="guide" 
                  value="1" 
                  name="guide" 
                  checked={form.guide == 1}
                  onCheckedChange={(val) => updateField('guide', val)}
                 />
                <FieldLabel htmlFor="guide">Przewodnik</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox 
                  id="cinema" 
                  value="1" 
                  name="cinema" 
                  checked={form.cinema == 1}
                  onCheckedChange={(val) => updateField('cinema', val)}
                 />
                <FieldLabel htmlFor="cinema">Kino</FieldLabel>
              </Field>
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
          </div>

          <Separator className="w-full" />

          <Tabs defaultValue="overview" className="w-full gap-6 px-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="cursor-pointer">Rezerwacja</TabsTrigger>
              <TabsTrigger value="contact" className="cursor-pointer">Kontakt</TabsTrigger>
              <TabsTrigger value="prices" className="cursor-pointer">Rozliczenie</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid flex-1 auto-rows-min gap-6">
                
                {form.appointment_providers && form.appointment_providers.map((as, index) => (<FieldGroup className="gap-3">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="sheet-demo-name">Sala</FieldLabel>
                    <NativeSelect className="w-full" value={form.appointment_providers[index].provider_id} onChange={(e) => updateProvider(index, 'provider_id', e.target.value)}>
                      <NativeSelectOption value=""></NativeSelectOption>
                      {form.providers.map((pr) => (<NativeSelectOption key={pr.id} value={pr.id}>{pr.name}</NativeSelectOption>))}
                    </NativeSelect>
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field className="gap-2">
                      <Input 
                        type="datetime-local"
                        name="start_time"
                        value={as.start_time}
                        onChange={(e) => updateProvider(index, 'start_time', e.target.value)}
                      />
                    </Field>
                    <Field className="gap-2">
                      <Input 
                        type="datetime-local"
                        name="end_time"
                        value={as.end_time}
                        onChange={(e) => updateProvider(index, 'end_time', e.target.value)}
                      />
                    </Field>
                  </div>
                </FieldGroup>))}

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
              <FieldGroup className="gap-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Dane klienta</FieldLabel>
                  <Input 
                    id="name"
                  />
                </Field>
                <Field className="gap-2">
                  <NativeSelect className="w-full" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                    <NativeSelectOption value=""></NativeSelectOption>
                    {customerTypes.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                  </NativeSelect>
                </Field>

                <Field className="gap-2">
                  <Input 
                    type="tel"
                    id="name"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    type="tel"
                    id="name"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    type="email"
                    id="email"
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Osoba do kontaktu</FieldLabel>
                  <Input 
                    id="email"
                    placeholder="Imię i nazwisko"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    type="tel"
                    id="email"
                    placeholder="Telefon"
                  />
                </Field>
                <Field className="gap-2">
                  <Input 
                    type="email"
                    id="email"
                    placeholder="E-mail"
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Ilość opiekunów</FieldLabel>
                  <Input 
                    type="number"
                    id="name"
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="prices">
              bb
            </TabsContent>
          </Tabs>
        </form>
        <SheetFooter className="border-t">
          <Button type="button" onClick={submitFormHandler} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}</Button>
          {/*<SheetClose render={<Button variant="outline" type="button">Zamknij</Button>} />*/}
        </SheetFooter>
        
      </SheetContent>}
    </Sheet>
  )
}

export default AppointmentEdit