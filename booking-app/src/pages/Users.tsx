import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import type { LoaderFunctionArgs } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers } from "@/api/users";
import UserEditDialog from "@/features/users/UserEditDialog";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";

export const usersQuery = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: getUsers,
  });

export const loader =
  (client: QueryClient) =>
  async (_args: LoaderFunctionArgs) => {
    await client.ensureQueryData(usersQuery());
    return null;
  };

const Users = () => {
  const { data: users } = useSuspenseQuery(usersQuery());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  return (
    <Card className="w-full h-full shadow-none ring-0">
      <CardHeader>
        <CardTitle>Użytkownicy</CardTitle>
        <form>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <Input name="username" placeholder="Szukaj w nazwie użytkownika" />
            </Field>
            <Field>
              <Input name="email" placeholder="Szukaj w adresie e-mail" />
            </Field>
          </FieldGroup>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Nazwa użytkownika</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Firma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer"
                onClick={() => setSelectedUserId(user.id)}
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.company.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <UserEditDialog userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </Card>
  );
};

export default Users;
