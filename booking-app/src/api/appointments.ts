import { apiUrl } from "./api";

export const getAppointments = async (queryString?: string) => {
  const response = await fetch(
    apiUrl + '/appointments' + queryString,
  )
  return await response.json()
}

