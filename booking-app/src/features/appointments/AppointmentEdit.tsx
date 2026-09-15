import { getAppointment, updateAppointment, type Appointment } from "@/api/appointments";
import type { Service } from "@/api/services";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
        queryClient.invalidateQueries({ queryKey: ["services"] });
        onClose();
      }
    },
  });

  useEffect(() => {
    if (itemQuery.data) {
      setForm(itemQuery.data);
    }
  }, [itemQuery.data]);

  const updateField = (field: string, value: string | number) => {
    console.log(field + '/' + value)
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };
  
  
  return (
    <Sheet 
      open={itemId !== null}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      {form && <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex gap-1.5 items-center"><div className={`size-3 rounded-full ${stateColors[form.state]}`}></div> Rezerwacja {form.id ? 'nr ' + form.id : 'NOWA'}</SheetTitle>
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
                <Checkbox id="admission" name="toggle-checkbox" />
                <FieldLabel htmlFor="admission">Wstęp na wystawy</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="guide" name="toggle-checkbox" />
                <FieldLabel htmlFor="guide">Przewodnik</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="cinema" name="toggle-checkbox" />
                <FieldLabel htmlFor="cinema">Kino</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="cinema" name="toggle-checkbox" />
                <FieldLabel htmlFor="cinema">Kulturalna Szkoła na Mazowszu</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="cinema" name="toggle-checkbox" />
                <FieldLabel htmlFor="cinema">Kultura za zł (wsparcie osób z niepełnospr.)</FieldLabel>
              </Field>
            </FieldGroup>
            <Field className="gap-2">
              <FieldLabel htmlFor="notes">Liczba uczestników</FieldLabel>
              <InputGroup>
                  <InputGroupInput 
                    type="number"
                    id="pax"
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
                <FieldGroup className="gap-3">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="sheet-demo-name">Sala</FieldLabel>
                    <NativeSelect className="w-full" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                      <NativeSelectOption value=""></NativeSelectOption>
                      {states.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                    </NativeSelect>
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field className="gap-2">
                      <Input 
                        type="datetime-local"
                      />
                    </Field>
                    <Field className="gap-2">
                      <Input 
                        type="datetime-local"
                      />
                    </Field>
                  </div>
                </FieldGroup>

                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Uwagi</FieldLabel>
                  <Textarea 
                    id="notes"
                    value={form.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="sheet-demo-name">Status</FieldLabel>
                  <NativeSelect className="w-full" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                    <NativeSelectOption value=""></NativeSelectOption>
                    {states.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                  </NativeSelect>
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <FieldGroup className="gap-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Nazwa</FieldLabel>
                  <Input 
                    id="name"
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Telefon</FieldLabel>
                  <Input 
                    type="tel"
                    id="name"
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">E-mail</FieldLabel>
                  <Input 
                    type="email"
                    id="email"
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="prices">
              bb
            </TabsContent>
          </Tabs>
        </form>
        <SheetFooter>
          <Button type="button">Zapisz zmiany</Button>
          <SheetClose render={<Button variant="outline" type="button">Zamknij</Button>} />
        </SheetFooter>
      </SheetContent>}
    </Sheet>
  )
}

export default AppointmentEdit