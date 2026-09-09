import { apiUrl, toFormData, type ErrorMessage } from "./api";

export interface Service {
  id: number;
  name: string;
  description: string;
  base_price: string;
  state: string | undefined | number;
  create_time: string;
  create_ip: string;
  update_time: string;
  update_ip: string;
}

const servicesUrl = apiUrl + "/services";

export interface ServiceFilters {
  q?: string;
  page?: string | number;
}

interface ApiItemsData {
  items: Service[];
  total_items: number;
  total_pages: number;
}

const getServiceResponse = async (response: Response): Promise<Service> => {
  if (!response.ok) {
    throw new Error(`Unable to load service: ${response.status}`);
  }

  return response.json() as Promise<Service>;
};

export const getServices = async (filters: ServiceFilters = {}): Promise<ApiItemsData> => {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page) {
    params.set("page", filters.page);
  }

  const query = params.toString();
  const response = await fetch(query ? `${servicesUrl}?${query}` : servicesUrl);

  if (!response.ok) {
    throw new Error(`Unable to load services: ${response.status}`);
  }

  return response.json() as Promise<ApiItemsData>;
};

export const getService = async (id: number): Promise<Service> =>
  getServiceResponse(await fetch(`${servicesUrl}/${id}`));

export const updateService = async (item: Service): Promise<Service | ErrorMessage> =>
  getServiceResponse(
    await fetch(`${servicesUrl}/${item.id}`, {
      method: "POST",
      body: toFormData(item),
    }),
  );
