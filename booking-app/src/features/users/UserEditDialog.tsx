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
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<User[]>(["users"], (users) =>
        users?.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      setForm(userQuery.data);
    }
  }, [userQuery.data]);

  const updateField = (field: "name" | "username" | "email" | "phone" | "website", value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onClose();
    }
  };

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
          <DialogTitle>Edytuj użytkownika</DialogTitle>
          <DialogDescription>Zaktualizuj dane użytkownika.</DialogDescription>
        </DialogHeader>
        {userQuery.isPending && <p className="text-sm text-muted-foreground">Ładowanie danych...</p>}
        {userQuery.isError && <p className="text-sm text-destructive">{userQuery.error.message}</p>}
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
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
