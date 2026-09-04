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

const getUserResponse = async (response: Response): Promise<User> => {
  if (!response.ok) {
    throw new Error(`Unable to load user: ${response.status}`);
  }

  return response.json() as Promise<User>;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(usersUrl);

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
