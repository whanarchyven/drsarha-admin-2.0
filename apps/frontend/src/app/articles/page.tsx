"use client"
import { DatePicker } from "@/components/date-picker";
import { getNews } from "@/shared/api/news/getNews";
import { useEffect, useState } from "react";
import { parse, format, addDays } from "date-fns";
import ArticleCard from "@/entities/Article/ui";
import { getArticles } from "@/shared/api/articles/getArticles";
import { StatTab } from "@/shared/ui/stat-tab";
import Pagination from "@/shared/ui/pagination";
import { Loader2 } from "lucide-react";
import { ArticleSearchDrawer } from "@/widgets/article-search-drawer";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem  } from "@/components/ui/select";
import { ru } from "date-fns/locale";
export default function ArticlesPage({searchParams}:{searchParams: any}) {
  const {start_date, end_date} = searchParams
  const [articles,setArticles] = useState<any[]>([])
  const [articlesInfo,setArticlesInfo] = useState<{all:number,published:number,deleted:number,translated:number}>({all:0,published:0,deleted:0,translated:0})
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    {label: "Детская дерматология", value: "Детская дерматология"},
    {label: "Дерматовенерология", value: "Дерматовенерология"},
    {label: "Трихология", value: "Трихология"},
    {label: "Дерматоскопия", value: "Дерматоскопия"},
    {label: "Дерматозы аногенитальной области", value: "Дерматозы аногенитальной области"},
    {label: "Дерматозы беременных", value: "Дерматозы беременных"},
    {label: "Дерматоонкология", value: "Дерматоонкология"},
  ]

  const [selectedSubCategory, setSelectedSubCategory] = useState<string|null  >(null)

  useEffect(()=>{
    try {
      setIsLoading(true);
      let formattedStartDate: string | undefined;
      let formattedEndDate: string | undefined;

      // Обрабатываем start_date, если он есть
      if (start_date) {
        try {
          // Если дата уже в правильном формате, используем её как есть
          if (start_date.includes('T') && start_date.includes('Z')) {
            formattedStartDate = start_date;
          } else {
            // Иначе парсим и форматируем
            const parsedDate = parse(start_date, "yyyy-MM-dd", new Date());
            formattedStartDate = format(parsedDate, "yyyy-MM-dd'T'00:00:00'Z'");
          }
        } catch (error) {
          console.error("Ошибка при обработке start_date:", error);
        }
      }

      // Обрабатываем end_date, если он есть
      if (end_date) {
        try {
          // Если дата уже в правильном формате, используем её как есть
          if (end_date.includes('T') && end_date.includes('Z')) {
            formattedEndDate = end_date;
          } else {
            // Иначе парсим и форматируем
            const parsedDate = parse(end_date, "yyyy-MM-dd", new Date());
            formattedEndDate = format(parsedDate, "yyyy-MM-dd'T'00:00:00'Z'");
          }
        } catch (error) {
          console.error("Ошибка при обработке end_date:", error);
        }
      } 
      // Если есть start_date, но нет end_date, автоматически устанавливаем end_date как start_date + 1 день
      else if (formattedStartDate && !formattedEndDate) {
        try {
          const startDate = new Date(formattedStartDate);
          const nextDay = addDays(startDate, 2);
          formattedEndDate = format(nextDay, "yyyy-MM-dd'T'00:00:00'Z'");
        } catch (error) {
          console.error("Ошибка при автоматическом создании end_date:", error);
        }
      }

      // Формируем параметры запроса
      const queryParams: any = {};
      if (formattedStartDate) queryParams.start_date = formattedStartDate;
      if (formattedEndDate) queryParams.end_date = formattedEndDate;
      queryParams.page = currentPage-1;
      if(selectedSubCategory) queryParams.subcategory = selectedSubCategory

      // Выполняем запрос
      getArticles(queryParams).then((res)=>{
        if (res.data) {
          console.log(res,"AUE RESPONSE")
          setArticlesInfo({all:res.all, published:res.published, deleted:res.deleted, translated:res.translated})
          setArticles(res.data);
          setIsLoading(false);
        } else {
          setArticles([]);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Ошибка при получении статей:", error);
      setArticles([]);
      setIsLoading(false);
    }
  },[start_date, end_date,currentPage,selectedSubCategory])

  

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Статьи за {format(new Date(start_date), "d MMMM yyyy",{locale:ru})}</h1>
        <DatePicker/>
      </div>

      <div className="grid grid-cols-4 my-8 gap-4">
        <StatTab title="Всего статей" value={articlesInfo.all} variant="default" />
        <StatTab title="Переведено" value={articlesInfo.translated} variant="default" />
        <StatTab title="Опубликовано" value={articlesInfo.published} variant="success" />
        <StatTab title="Удалено" value={articlesInfo.deleted} variant="error" />
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="max-w-1/3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(articlesInfo.all / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="flex items-center gap-4">
          <ArticleSearchDrawer/>
          <Select
            value={selectedSubCategory ?? ""}
            onValueChange={(value:string) => setSelectedSubCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
      </div>
      
      {isLoading?<div className="flex justify-center items-center my-10">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>:<div className="mt-6">
        {articles.length > 0 ? (
          <div className="grid gap-4">
            {articles.map((item, index) => (
              <ArticleCard key={index} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Статьи не найдены</p>
        )}
      </div>}
    </div>
  )
}