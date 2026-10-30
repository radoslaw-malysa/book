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
import { AtSign, Clock, ContactRound, ListChecks, Mail, MapPin, MessageCircleWarning, PersonStanding, Phone, Printer, UserRound } from "lucide-react";
import { useEffect, useMemo, useReducer, useState, type ChangeEvent } from "react";
import './appointment_edit.css';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { getServiceProviders, type Provider } from "@/api/providers";
import Calculation from "@/components/Calculation";
import appointmentReducer from "@/state/appointment-reducer";

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

const AppointmentEditRed = ({ itemId, refreshKey, onClose }: ItemEditDialogProps) => {
  const queryClient = useQueryClient();
  //const [form, setForm] = useState<Appointment | null>(null);
  const [form, dispatch] = useReducer(appointmentReducer, null);

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
      dispatch({
        type: 'LOAD_DATA',
        data: itemQuery.data
      });
      //setForm(itemQuery.data);
    }
  }, [itemQuery.data]);

  const updateField = (field: string, value: string | number | boolean) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: field,
      value: value
    });
  };

  const updateCustomer = (key: string, value: number | string) => {
    dispatch({
      type: 'UPDATE_CUSTOMER',
      key: key,
      value: value
    });
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };
  
  const submitFormHandler = () => {
    updateMutation.mutate(form);
  }

  const updateAppointmentProvider = (serviceType: string, index: number, key: string, value: number | string) => {
    dispatch({
      type: 'UPDATE_APP_PROVIDER',
      serviceType: serviceType,
      index: index,
      key: key,
      value: value
    });
  }

  const handleServiceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const serviceType = e.target.name;
    const serviceId = e.target.value;
    
    if (serviceId) {
      const res = await getServiceProviders(serviceId);

      dispatch({
        'type': 'CHANGE_SERVICE',
        serviceType: serviceType,
        serviceId: serviceId,
        providers: res.items
      });
    }
  }

  // calculation
  const calculation = useMemo(() => {
    const newCalculation = {lesson: null, tour: null, total_price: 0, sell_price: 0};

    if (form) {
      if (form?.lesson == 1 && form.appointment_providers.lesson[0].service_id) {
        const selectedLesson = form.services.lesson.find((el) => el.id === parseInt(form.appointment_providers.lesson[0].service_id));
        if (selectedLesson) {
          newCalculation.lesson = {
            name: selectedLesson?.name,
            price: selectedLesson?.price,
            qty: form.pax
          }
          newCalculation.total_price = selectedLesson?.price * form.pax;
        }
      }

      if (form?.tour == 1 && form.appointment_providers.tour[0].service_id) {
        const selectedTour = form.services.tour.find((el) => el.id === parseInt(form.appointment_providers.tour[0].service_id));
        if (selectedTour) {
          newCalculation.tour = {
            name: selectedTour?.name,
            price: selectedTour?.price,
            qty: form.pax
          }
          newCalculation.total_price += selectedTour?.price * form.pax;
        }
      }
    
      newCalculation.sell_price = (form?.kulturalna_szkola == 1 && newCalculation.total_price > 0) ? (form.pax * 1) : newCalculation.total_price;
    }

    return newCalculation;

  }, [form?.lesson, form?.appointment_providers.lesson[0].service_id, form?.tour, form?.appointment_providers.tour[0].service_id, form?.kulturalna_szkola, form?.pax]);

  
  /*useEffect(() => {
    if (form) {
      const newData= {total_price: calculation.total_price, sell_price: calculation.sell_price }
      console.log(newData)
      setForm((prev) => ({ ...prev, ...newData }));
    }
  }, [form?.lesson, form?.appointment_providers.lesson[0].service_id, form?.appointment_providers.tour[0].service_id, form?.kulturalna_szkola, form?.pax])
  */
  
  console.log('RENDER');
  
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
        <SheetHeader className="h-head pl-4">
          <SheetTitle className="flex gap-3 items-center leading-none">
            <div className="w-9 flex-none flex justify-center items-center">
              <div className={`size-4 rounded-full ${stateColors[form.state]}`}></div>
            </div>
            <div>Rezerwacja {form.id ? 'nr ' + form.id : 'NOWA'}</div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="xh-side ">
        <form onSubmit={(event) => {
          event.preventDefault();
          updateMutation.mutate(form);
        }}
        >
          <Tabs defaultValue="overview" className="w-full gap-0">
            <div className="px-4 pb-4 border-b">
              <TabsList variant="default" className="w-full primary-tabs ">
                <TabsTrigger value="overview" className="cursor-pointer">Rezerwacja</TabsTrigger>
                <TabsTrigger value="contact" className="cursor-pointer">Kontakt</TabsTrigger>
                <TabsTrigger value="prices" className="cursor-pointer">Rozliczenie</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview">
              <div className="h-tab no-scrollbar overflow-y-auto">

                <div className="py-2">
                  <label htmlFor="show-lessons" className="px-4 flex gap-3 cursor-pointer">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Checkbox id="show-lessons" value="1" checked={form.lesson == 1} onCheckedChange={(checked) => updateField('lesson', checked ? 1 : 0)} />
                    </div>
                    <div className={`flex-grow flex items-center h-9 font-semibold ${form.lesson == 1 ? '' : 'text-muted-foreground'}`}>
                      Warsztaty
                    </div>
                  </label>

                  {form.lesson == 1 && (<div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none"></div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect name="lesson" className="w-full" value={form.appointment_providers.lesson[0].service_id} onChange={handleServiceChange}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.services['lesson'].map((s: Service) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-2">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.lesson[0].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.lesson[0].provider_id} onChange={(e) => updateAppointmentProvider('lesson', 0, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.lesson[1].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.lesson[1].provider_id} onChange={(e) => updateAppointmentProvider('lesson', 1, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <Clock size="20" />
                      </div>
                      <div className="flex-grow flex gap-2">
                        <Field>
                          <Input 
                            type="date"
                            value={form.appointment_providers.lesson[0].start_time ? form.appointment_providers.lesson[0].start_time.split(' ')[0] : ''}
                            onChange={(e) => updateAppointmentProvider('lesson', 0, 'start_time_y', e.target.value)}
                          />
                        </Field>
                        <Field>
                          <Input 
                            type="time"
                            value={form.appointment_providers.lesson[0].start_time ? form.appointment_providers.lesson[0].start_time.split(' ')[1] : ''}
                            onChange={(e) => updateAppointmentProvider('lesson', 0, 'start_time_h', e.target.value)}
                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                        <Field>
                          <Input 
                            type="time"
                            name="visit_time"
                            value={form.appointment_providers.lesson[0].end_time ? form.appointment_providers.lesson[0].end_time.split(' ')[1] : ''}
                            onChange={(e) => updateAppointmentProvider('lesson', 0, 'end_time_h', e.target.value)}
                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>)}
                </div>

                <Separator />

                <div className="py-2">
                  <label htmlFor="show-tour" className="px-4 flex gap-3 cursor-pointer">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Checkbox id="show-tour" value="1" checked={form.tour == 1} onCheckedChange={(checked) => updateField('tour', checked ? 1 : 0)} />
                    </div>
                    <div className={`flex-grow flex items-center h-9 font-semibold ${form.tour == 1 ? '' : 'text-muted-foreground'}`}>
                      Zwiedzanie wystaw
                    </div>
                  </label>

                  {form.tour == 1 && (<div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none"></div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect name="tour" className="w-full" value={form.appointment_providers.tour[0].service_id} onChange={handleServiceChange}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.services['tour'].map((s: Service) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-2">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.tour[0].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.tour[0].provider_id} onChange={(e) => updateAppointmentProvider('tour', 0, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.tour[1].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.tour[1].provider_id} onChange={(e) => updateAppointmentProvider('tour', 1, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <Clock size="20" />
                      </div>
                      <div className="flex-grow flex gap-2">
                        <Field>
                          <Input 
                            type="date"
                            value={form.appointment_providers.tour[0].start_time ? form.appointment_providers.tour[0].start_time.split(' ')[0] : ''}
                            onChange={(e) => updateAppointmentProvider('tour', 0, 'start_time_y', e.target.value)}
                          />
                        </Field>
                        <Field>
                          <Input 
                            type="time"
                            value={form.appointment_providers.tour[0].start_time ? form.appointment_providers.tour[0].start_time.split(' ')[1] : ''}
                            onChange={(e) => updateAppointmentProvider('tour', 0, 'start_time_h', e.target.value)}
                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                        <Field>
                          <Input 
                            type="time"
                            value={form.appointment_providers.tour[0].end_time ? form.appointment_providers.tour[0].end_time.split(' ')[1] : ''}
                            onChange={(e) => updateAppointmentProvider('tour', 0, 'end_time_h', e.target.value)}
                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>)}
                </div>

                <Separator />

                <div className="py-2">
                  <label htmlFor="show-cinema" className="px-4 flex gap-3 cursor-pointer">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Checkbox id="show-cinema" value="1" checked={form.cinema == 1} onCheckedChange={(checked) => updateField('cinema', checked ? 1 : 0)} />
                    </div>
                    <div className={`flex-grow flex items-center h-9 font-semibold ${form.cinema == 1 ? '' : 'text-muted-foreground'}`}>
                      Kino
                    </div>
                  </label>

                  {form.cinema == 1 && (<div>
                    
                  </div>)}
                </div>

                <Separator />

                <div className="py-2">
                  <label htmlFor="show-blockade" className="px-4 flex gap-3 cursor-pointer">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Checkbox id="show-blockade" value="1" checked={form.blockade == 1} onCheckedChange={(checked) => updateField('blockade', checked ? 1 : 0)} />
                    </div>
                    <div className={`flex-grow flex items-center h-9 font-semibold ${form.blockade == 1 ? '' : 'text-muted-foreground'}`}>
                      Blokowanie sali
                    </div>
                  </label>

                  {form.blockade == 1 && (<div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none"></div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.blockade[0].service_id} onChange={(e) => updateAppointmentProvider('blockade', 0, 'service_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.services['blockade'].map((s: Service) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-2">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.blockade[0].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.blockade[0].provider_id} onChange={(e) => updateAppointmentProvider('blockade', 0, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <MapPin size="20" className={`${!form.appointment_providers.blockade[1].provider_id ? 'text-muted-foreground' : ''}`} />
                      </div>
                      <div className="flex-grow">
                        <Field>
                          <NativeSelect className="w-full" value={form.appointment_providers.blockade[1].provider_id} onChange={(e) => updateAppointmentProvider('blockade', 1, 'provider_id', e.target.value)}>
                            <NativeSelectOption value=""></NativeSelectOption>
                            {form.providers.map((s: Provider) => (<NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>))}
                          </NativeSelect>
                        </Field>
                      </div>
                    </div>
                    <div className="px-4 flex gap-3 mb-4">
                      <div className="w-9 h-9 flex-none flex justify-center items-center">
                        <Clock size="20" />
                      </div>
                      <div className="flex-grow grid grid-cols-2 gap-px">
                        <Field>
                          <Input 
                            type="datetime-local"
                            value={form.appointment_providers.blockade[0].start_time ? form.appointment_providers.blockade[0].start_time : ''}
                            onChange={(e) => updateAppointmentProvider('blockade', 0, 'start_time', e.target.value)}
                            className="px-1.5"
                          />
                        </Field>
                        <Field>
                          <Input 
                            type="datetime-local"
                            value={form.appointment_providers.blockade[0].end_time ? form.appointment_providers.blockade[0].end_time : ''}
                            onChange={(e) => updateAppointmentProvider('blockade', 0, 'end_time', e.target.value)}
                            className="px-1.5"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>)}
                </div>

                <Separator />

              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="h-tab no-scrollbar overflow-y-auto">

                <div className="px-4 flex gap-3 mb-2 mt-4">
                  <div className="w-9 flex-none flex"></div>
                  <div className="flex-grow">
                    <Label htmlFor="name" className="leading-snug">Dane szkoły/klienta</Label>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <ContactRound size="20" />
                    </div>
                    <div className="flex-grow">
                      <Input 
                        name="name"
                        placeholder="Nazwa"
                        value={form.customer.name}
                        onChange={(e) => updateCustomer('name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none"></div>
                    <div className="flex-grow">
                      <NativeSelect className="w-full" value={form.customer.customer_type} onChange={(e) => updateCustomer('customer_type', e.target.value)}>
                        <NativeSelectOption value="">Wybierz typ klienta</NativeSelectOption>
                        {customerTypes.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                      </NativeSelect>
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none"></div>
                    <div className="flex-grow">
                      <Input 
                        name="address"
                        placeholder="Adres ulica, nr domu"
                        value={form.customer.address}
                        onChange={(e) => updateCustomer('address', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none"></div>
                    <div className="flex-grow grid grid-cols-3 gap-1">
                      <Input 
                        name="zip"
                        placeholder="Kod poczt."
                        value={form.customer.zip}
                        onChange={(e) => updateCustomer('zip', e.target.value)}
                      />
                      <Input 
                        name="city"
                        placeholder="Miasto"
                        value={form.customer.city}
                        onChange={(e) => updateCustomer('city', e.target.value)}
                        className="col-span-2"
                      />
                    </div>
                  </div>


                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Phone size="20" />
                    </div>
                    <div className="flex-grow">
                      <Input 
                        name="phone"
                        placeholder="Telefon"
                        value={form.customer.phone}
                        onChange={(e) => updateCustomer('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <AtSign size="20" />
                    </div>
                    <div className="flex-grow">
                      <Input 
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={form.customer.email}
                        onChange={(e) => updateCustomer('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="px-4 flex gap-3 mb-2 mt-4">
                  <div className="w-9 flex-none flex"></div>
                  <div className="flex-grow">
                    <Label htmlFor="contact_name" className="leading-snug">Osoba do kontaktu</Label>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <UserRound size="20" />
                    </div>
                    <div className="flex-grow">
                      <Input 
                        name="contact_name"
                        value={form.customer.contact_name}
                        onChange={(e) => updateCustomer('contact_name', e.target.value)}
                        placeholder="Imię i nazwisko"
                      />
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <Phone size="20" />
                    </div>
                    <div className="flex-grow">
                      <Input 
                        name="contact_phone"
                        value={form.customer.contact_phone}
                        onChange={(e) => updateCustomer('contact_phone', e.target.value)}
                        placeholder="Telefon"
                      />
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <AtSign size="20" />
                    </div>
                    <div className="flex-grow">
                     <Input 
                        name="contact_email"
                        value={form.customer.contact_email}
                        onChange={(e) => updateCustomer('contact_email', e.target.value)}
                        placeholder="E-mail"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="px-4 flex gap-3 mb-2 mt-4">
                  <div className="w-9 flex-none flex"></div>
                  <div className="flex-grow">
                    <Label htmlFor="pax_care" className="leading-snug">Ilość opiekunów</Label>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none"></div>
                    <div className="flex-grow">
                      <Input 
                        name="pax_care"
                        value={form.customer.pax_care}
                        onChange={(e) => updateCustomer('pax_care', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <ListChecks size="20" />
                    </div>
                    <div className="flex-grow pt-2">
                      <FieldGroup className="gap-2">
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
                    </div>
                  </div>

                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none"></div>
                    <div className="flex-grow">
                      <Button variant="outline" className="mb-2"><Printer data-icon="inline-start" /> Wniosek Kultura za zł</Button>
                      <Button variant="outline"><Mail data-icon="inline-start" /> Poinformuj o rezerwacji</Button>
                    </div>
                  </div>
                </div>
                
              </div>
            </TabsContent>

            <TabsContent value="prices">
              <div className="h-tab no-scrollbar overflow-y-auto">
                
                <div className="flex flex-col gap-2 mb-4 mt-4">
                  <div className="px-4 flex gap-3">
                    <div className="w-9 flex-none"></div>
                    <div className="flex-grow">
                      <Label htmlFor="pax" className="leading-snug">Liczba uczestników</Label>
                    </div>
                  </div>
                  <div className="px-4 flex gap-3">
                    <div className="w-9 h-9 flex-none flex justify-center items-center">
                      <PersonStanding size="20" />
                    </div>
                    <div className="flex-grow">
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
                    </div>
                  </div>
                </div>

                <div className="px-4 flex gap-3 mb-4">
                  <div className="w-9 h-9 flex-none flex justify-center items-center">
                    
                  </div>
                  <div className="flex-grow pt-2">
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
                </div>

                <Separator />
                <Calculation calculation={form.calculation} />
                <Separator />

                <div className="flex flex-col gap-4 my-4">
                  <div className="px-4 flex gap-3">
                    <div className="w-9 flex-none"></div>
                    <div className="flex-grow">
                      <FieldGroup className="gap-3">
                        <Field className="gap-2">
                          <FieldLabel htmlFor="total_price">Cena z cennika {form.total_price}</FieldLabel>
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
                          <FieldLabel htmlFor="sell_price">Cena sprzedaży</FieldLabel>
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
                    </div>
                  </div>

                </div>

                <Separator />
                
                <div className="px-4 flex gap-3 my-4">
                  <div className="w-9 h-9 flex-none flex justify-center items-center">
                    <MessageCircleWarning size="20" />
                  </div>
                  <div className="flex-grow">
                    <Textarea 
                      id="notes"
                      placeholder="Uwagi"
                      value={form.notes}
                      onChange={(event) => updateField('notes', event.target.value)}
                    />
                  </div>
                </div>

                <div className="px-4 flex gap-3 mb-4">
                  <div className="w-9 h-9 flex-none flex justify-center items-center">
                    <div className="w-9 flex-none flex justify-center items-center">
                      <div className={`size-4 rounded-full ${stateColors[form.state]}`}></div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <NativeSelect id="state" className="w-full" value={form.state} onChange={(e) => updateField('state', e.target.value)}>
                      <NativeSelectOption value=""></NativeSelectOption>
                      {states.map((st) => (<NativeSelectOption key={st.value} value={st.value}>{st.label}</NativeSelectOption>))}
                    </NativeSelect>
                  </div>
                </div>
              </div>
              

              
            </TabsContent>
          </Tabs>
        </form>
        </div>
        <SheetFooter className="h-foot border-t px-4">
          <Button type="button" onClick={submitFormHandler} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}</Button>
        </SheetFooter>
        
      </SheetContent>}
    </Sheet>
  )
}

export default AppointmentEditRed