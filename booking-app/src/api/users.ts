export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

const usersUrl = "https://jsonplaceholder.typicode.com/users";

export interface UserFilters {
  username?: string;
  email?: string;
}

const getUserResponse = async (response: Response): Promise<User> => {
  if (!response.ok) {
    throw new Error(`Unable to load user: ${response.status}`);
  }

  return response.json() as Promise<User>;
};

export const getUsers = async (filters: UserFilters = {}): Promise<User[]> => {
  const params = new URLSearchParams();

  if (filters.username) {
    params.set("username", filters.username);
  }
  if (filters.email) {
    params.set("email", filters.email);
  }

  const query = params.toString();
  const response = await fetch(query ? `${usersUrl}?${query}` : usersUrl);

  if (!response.ok) {
    throw new Error(`Unable to load users: ${response.status}`);
  }

  return response.json() as Promise<User[]>;
};

export const getUser = async (id: number): Promise<User> =>
  getUserResponse(await fetch(`${usersUrl}/${id}`));

export const updateUser = async (user: User): Promise<User> =>
  getUserResponse(
    await fetch(`${usersUrl}/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }),
  );
