import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface User {
  id: number;
  email: string;
  password: string;
  title: string;
  id_group: string | undefined | number;
  state: string | undefined | number;
  create_time: string;
  create_ip: string;
  update_time: string;
  update_ip: string;
}

// const usersUrl = "https://jsonplaceholder.typicode.com/users";
const usersUrl = apiUrl + "/users";

export interface UserFilters {
  q?: string;
  page?: string | number;
}

interface ApiItemsData {
  items: User[];
  total_items: number;
  total_pages: number;
}

const getUserResponse = async (response: Response): Promise<User> => {
  if (!response.ok) {
    throw new Error(`Unable to load user: ${response.status}`);
  }

  return response.json() as Promise<User>;
};

export const getUsers = async (filters: UserFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${usersUrl}?${query}` : usersUrl);

  if (!response.ok) {
    throw new Error(`Unable to load users: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getUser = async (id: number): Promise<User> =>
  getUserResponse(await fetch(`${usersUrl}/${id}`));

export const updateUser = async (user: User): Promise<User | ErrorMessage> =>
  getUserResponse(
    await fetch(`${usersUrl}/${user.id}`, {
      method: "POST",
      body: toFormData(user),
    }),
  );
