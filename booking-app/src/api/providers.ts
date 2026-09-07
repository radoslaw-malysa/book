import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface Provider {
  id: number;
  salon_id: number;
  name: string;
  description: string;
  state: string | undefined | number;
}

const providersUrl = apiUrl + "/providers";

export interface ProviderFilters {
  q?: string;
  page?: string | number;
}

interface ApiItemsData {
  items: Provider[];
  total_items: number;
  total_pages: number;
}

const getProviderResponse = async (response: Response): Promise<Provider> => {
  if (!response.ok) {
    throw new Error(`Unable to load provider: ${response.status}`);
  }

  return response.json() as Promise<Provider>;
};

export const getProviders = async (filters: ProviderFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${providersUrl}?${query}` : providersUrl);

  if (!response.ok) {
    throw new Error(`Unable to load services: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getProvider = async (id: number): Promise<Provider> =>
  getProviderResponse(await fetch(`${providersUrl}/${id}`));

export const updateProvider = async (item: Provider): Promise<Provider | ErrorMessage> =>
  getProviderResponse(
    await fetch(`${providersUrl}/${item.id}`, {
      method: "POST",
      body: toFormData(item),
    }),
  );
