import { eden } from "@/features/eden/eden"

// Определяем интерфейс для параметров запроса
interface GetAllAnketsQuery {
  page: number;
  limit: number;
  tariff?: string;
  search?: string;
}

export const getAllAnkets = async (page: number, limit: number, search: string, tariff: string) => {

  const response = await eden["main-backend"]["get-all-users"].get({
    query: {
      page,
      limit,
      tariff,
      search
    } as GetAllAnketsQuery
  })
  console.log(response.data,"response.data")

  return response.data
}