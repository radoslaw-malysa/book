import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getService, updateService, type Service } from "@/api/services";
import { Field, FieldContent, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";

interface ItemEditDialogProps {
  itemId: number | null;
  onClose: () => void;
}

const states = [
  { label: 'Wybierz status', value: null },
  { label: 'Aktywny', value: 1 },
  { label: 'Zablokowany', value: 2 },
  { label: 'Usunięty', value: 3 }
];
const days = {
  1: {label: 'Pon.'},
  2: {label: 'Wt.'},
  3: {label: 'Śr.'},
  4: {label: 'Czw.'},
  5: {label: 'Pt.'},
  6: {label: 'Sob.'},
  7: {label: 'Niedz.'}
};

const ServiceEditDialog = ({ itemId, onClose }: ItemEditDialogProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Service | null>(null);

  const itemQuery = useQuery({
    queryKey: ["service", itemId],
    queryFn: () => getService(itemId as number),
    enabled: itemId !== null,
  });
  
  const updateMutation = useMutation({
    mutationFn: updateService,
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
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateCategory = (id: string, value: boolean) => {
    const newCategories = form?.categories;
    if (newCategories) {
      newCategories[id].selected = value ? 1 : 0;
      setForm((current) => (current ? { ...current, categories: newCategories } : current));
    }
  }

  const updateSchedule = (d: string, ord: number, value: string) => {
    const newSchedule = form?.schedule;
    if (newSchedule) {
      newSchedule[d][ord] = value;
      setForm((current) => (current ? { ...current, schedule: newSchedule } : current));
    }
  }

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };

  
  return (
    <Dialog
      open={itemId !== null}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edycja warsztatów</DialogTitle>
        </DialogHeader>
        {itemQuery.isPending && <p className="text-sm text-muted-foreground">Ładowanie danych...</p>}
        {itemQuery.isError && <p className="text-sm text-destructive">{itemQuery.error.message}</p>}
        {form && (
          <form onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate(form);
          }}>

            <Tabs defaultValue="overview" className="w-full gap-6">
              <TabsList>
                <TabsTrigger value="overview" className="cursor-pointer">Ustawienia</TabsTrigger>
                <TabsTrigger value="schedule" className="cursor-pointer">Harmonogram</TabsTrigger>
                <TabsTrigger value="categories" className="cursor-pointer">Grupy odbiorców</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <FieldGroup className="gap-6">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="name">Nazwa warsztatów</FieldLabel>
                    <Input 
                      id="name"
                      value={form.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      required 
                    />
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="description">Uwagi</FieldLabel>
                    <Input 
                      id="description"
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="online" className="cursor-pointer">
                        Dostępne do rezerwacji online
                      </FieldLabel>
                    </FieldContent>
                    <Switch id="online" value="1" className="cursor-pointer" checked={form.online === 1} onCheckedChange={(v) => updateField('online', v ? 1 : 0)} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="price">Cena</FieldLabel>
                    <InputGroup>
                      <InputGroupInput 
                        id="price" 
                        placeholder="" 
                        type="number" 
                        value={form.price} 
                        onChange={(event) => updateField('price', event.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        zł
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field className="gap-2">
                    <FieldLabel>Status</FieldLabel>
                    <Select 
                      items={states} 
                      value={form.state}
                      onValueChange={(val) => updateField('state', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {states.map((item) => (
                            <SelectItem key={item.label} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="schedule" className="flex flex-col gap-6">
                <Field>
                  <FieldLabel htmlFor="price">Czas trwania zajęć</FieldLabel>
                  <InputGroup>
                    <InputGroupInput 
                      id="duration" 
                      placeholder="" 
                      type="number" 
                      value={form.duration} 
                      onChange={(event) => updateField('duration', event.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      minut
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>Godziny rozpoczęcia zajęć</FieldLabel>
                  <div className="flex flex-col gap-1">
                    {form.schedule && Object.keys(form.schedule).map((d) => (<div key={d} className="grid grid-cols-5 gap-1 w-full">
                      <div className="font-medium flex items-center">{days[d].label}</div>
                      {form.schedule[d].map((n, index) => (<div>
                        <Input key={n} type="time" value={form.schedule[d][index]} onChange={(e) => updateSchedule(d, index, e.target.value)}  />
                      </div>))}
                    </div>))}
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="categories">
                <FieldSet>
                  <FieldLegend variant="label" className="mb-4">
                    Warsztaty są przeznaczone dla:
                  </FieldLegend>
                  <FieldGroup className="gap-4">
                    {form.categories && Object.keys(form.categories).map((id) => (<Field key={id} orientation="horizontal">
                      <Checkbox
                        id={`cat${id}`}
                        name={`categories[${id}]`}
                        value={id}
                        checked={form.categories[id].selected === 1}
                        onCheckedChange={(val) => updateCategory(id, val)}
                      />
                      <FieldLabel
                        htmlFor={`cat${id}`}
                        className="font-normal cursor-pointer"
                      >
                        {form.categories[id].name}
                      </FieldLabel>
                    </Field>))}
                    
                  </FieldGroup>
                </FieldSet>
              </TabsContent>
            </Tabs>

            
                




            

            
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Anuluj
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        )}
        
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;
