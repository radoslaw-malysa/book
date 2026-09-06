import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface Category {
  id: number;
  salon_id: number;
  name: string;
  state: string | undefined | number;
  ord: number;
}

const categoriesUrl = apiUrl + "/categories";

export interface CategoryFilters {
  q?: string;
  page?: string | number;
}

interface ApiItemsData {
  items: Category[];
  total_items: number;
  total_pages: number;
}

const getCategoryResponse = async (response: Response): Promise<Category> => {
  if (!response.ok) {
    throw new Error(`Unable to load category: ${response.status}`);
  }

  return response.json() as Promise<Category>;
};

export const getCategories = async (filters: CategoryFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${categoriesUrl}?${query}` : categoriesUrl);

  if (!response.ok) {
    throw new Error(`Unable to load appointments: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getCategory = async (id: number): Promise<Category> =>
  getCategoryResponse(await fetch(`${categoriesUrl}/${id}`));

export const updateCategory = async (item: Category): Promise<Category | ErrorMessage> =>
  getCategoryResponse(
    await fetch(`${categoriesUrl}/${item.id}`, {
      method: "POST",
      body: toFormData(item),
    }),
  );
