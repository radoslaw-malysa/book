import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getService, updateService, type Service } from "@/api/services";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface ItemEditDialogProps {
  itemId: number | null;
  onClose: () => void;
}

const ServiceEditDialog = ({ itemId, onClose }: ItemEditDialogProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Service | null>(null);

  const userQuery = useQuery({
    queryKey: ["users", itemId],
    queryFn: () => getService(itemId as number),
    enabled: itemId !== null,
  });
  
  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: (resp) => {
      console.log(resp)
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
    if (userQuery.data) {
      setForm(userQuery.data);
    }
  }, [userQuery.data]);

  const updateField = (field: "name" | "description" | "state", value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };

  const userGroups = [
    { label: 'Wybierz grupę', value: undefined },
    { label: 'Administrator', value: 1 },
    { label: 'Redaktor', value: 2 }
  ];

  const states = [
    { label: 'Wybierz status', value: null },
    { label: 'Aktywny', value: 1 },
    { label: 'Zablokowany', value: 2 },
    { label: 'Usunięty', value: 3 }
  ];

  return (
    <Dialog
      open={itemId !== null}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edycja warsztatów</DialogTitle>
          <DialogDescription>Zaktualizuj dane warsztatów.</DialogDescription>
        </DialogHeader>
        {userQuery.isPending && <p className="text-sm text-muted-foreground">Ładowanie danych...</p>}
        {userQuery.isError && <p className="text-sm text-destructive">{userQuery.error.message}</p>}
        {form && (
          <form onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate(form);
          }}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nazwa warsztatów</FieldLabel>
                <Input 
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  required 
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Opis</FieldLabel>
                <Input 
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                />
              </Field>
              <Field>
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
