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

const usersQuery = () =>
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

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Użytkownicy</h1>
        <p className="text-muted-foreground">Lista użytkowników systemu.</p>
      </div>
      <div className="rounded-md border">
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
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.company.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Users;
