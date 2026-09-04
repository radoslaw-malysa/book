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

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(usersUrl);

  if (!response.ok) {
    throw new Error(`Unable to load users: ${response.status}`);
  }

  return response.json() as Promise<User[]>;
};
