import { News } from "@/entities/News/model";
import { eden } from "@/features/eden/eden";

type NewsResponse = {
  all:number,
  deleted:number,
  published:number,
  data:News[]
};


export const getNews = async ({page, limit, search, sort_by, sort_order, start_date, end_date, category}:{page?: number, limit?: number, search?: string, sort_by?: string, sort_order?: string, start_date?: string, end_date?: string, category?: string}): Promise<NewsResponse> => {

    const query = {
        page: page ?? 0,
        ...(limit !== undefined && { limit }),
        ...(search !== undefined && { search }),
        ...(sort_by !== undefined && { sort_by }),
        ...(sort_order !== undefined && { sort_order }),
        ...(start_date !== undefined && { start_date }),
        ...(end_date !== undefined && { end_date }),
        ...(category !== undefined && { category }),
        ...(sort_order !== undefined && { sort_order }),
    }
    console.log(query)

  const response = await eden.editor.news.get({
    query: query
  });
  return response.data as unknown as NewsResponse;
}