import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, type LoaderFunctionArgs } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers, type UserFilters } from "@/api/users";
import UserEditDialog from "@/features/users/UserEditDialog";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";

export const usersQuery = (filters: UserFilters = {}) =>
  queryOptions({
    queryKey: ["users", filters.username ?? "", filters.email ?? ""],
    queryFn: () => getUsers(filters),
  });

export const loader =
  (client: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;
    const filters: UserFilters = {
      username: searchParams.get("username") ?? undefined,
      email: searchParams.get("email") ?? undefined,
    };

    await client.ensureQueryData(usersQuery(filters));
    return null;
  };

const Users = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserFilters>({
    username: searchParams.get("username") ?? "",
    email: searchParams.get("email") ?? "",
  });
  const { data: users } = useSuspenseQuery(usersQuery(filters));
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    setFilters({
      username: searchParams.get("username") ?? "",
      email: searchParams.get("email") ?? "",
    });
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearchParams = new URLSearchParams();

      if (filters.username) {
        nextSearchParams.set("username", filters.username);
      }
      if (filters.email) {
        nextSearchParams.set("email", filters.email);
      }

      if (nextSearchParams.toString() !== searchParams.toString()) {
        navigate({ search: nextSearchParams.toString() }, { replace: true });
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters, navigate, searchParams]);

  return (
    <Card className="w-full h-full shadow-none ring-0">
      <CardHeader>
        <CardTitle>Użytkownicy</CardTitle>
        <form onSubmit={(event) => event.preventDefault()}>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <Input
                name="username"
                placeholder="Szukaj w nazwie użytkownika"
                value={filters.username}
                onChange={(event) => setFilters((current) => ({ ...current, username: event.target.value }))}
              />
            </Field>
            <Field>
              <Input
                name="email"
                placeholder="Szukaj w adresie e-mail"
                value={filters.email}
                onChange={(event) => setFilters((current) => ({ ...current, email: event.target.value }))}
              />
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
