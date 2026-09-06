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
import { getUser, updateUser, type User } from "@/api/users";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface UserEditDialogProps {
  userId: number | null;
  onClose: () => void;
}

const UserEditDialog = ({ userId, onClose }: UserEditDialogProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<User | null>(null);

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId as number),
    enabled: userId !== null,
  });
  
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (resp) => {
      console.log(resp)
      if (resp.message) {
        toast.add({
          type: "error",
          title: "Błąd!",
          description: resp.message
        })
      } else {
        /*queryClient.setQueryData<User[]>(["users"], (users) =>
          users?.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
        );*/
        queryClient.invalidateQueries({ queryKey: ["users"] });
        onClose();
      }
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      setForm(userQuery.data);
    }
  }, [userQuery.data]);

  const updateField = (field: "email" | "passwd" | "title" | "state" | "id_group", value: string) => {
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
      open={userId !== null}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edycja użytkownika</DialogTitle>
          <DialogDescription>Zaktualizuj dane użytkownika.</DialogDescription>
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
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input 
                  id="email"
                  type="email" 
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required 
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="passwd">Ustaw hasło</FieldLabel>
                <Input 
                  type="password" 
                  id="passwd"
                  value={form.passwd}
                  onChange={(event) => updateField('passwd', event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Nazwa użytkownika</FieldLabel>
                <Input 
                  id="title" 
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Grupa uprawnień</FieldLabel>
                <Select 
                  items={userGroups} 
                  value={form.id_group}
                  onValueChange={(val) => updateField('id_group', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {userGroups.map((item) => (
                        <SelectItem key={item.label} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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

export default UserEditDialog;

/*
{form && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              updateMutation.mutate(form);
            }}
          >
            {([
              ["name", "Imię i nazwisko"],
              ["username", "Nazwa użytkownika"],
              ["email", "E-mail"],
              ["phone", "Telefon"],
              ["website", "Strona internetowa"],
            ] as const).map(([field, label]) => (
              <label className="block space-y-1.5 text-sm font-medium" key={field}>
                {label}
                <Input
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  required
                />
              </label>
            ))}
            {updateMutation.isError && (
              <p className="text-sm text-destructive">{updateMutation.error.message}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Anuluj
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        )}
          */