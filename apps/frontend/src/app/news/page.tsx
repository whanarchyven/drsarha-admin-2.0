"use client"
import { DatePicker } from "@/components/date-picker";
import { getNews } from "@/shared/api/news/getNews";
import { useEffect, useState } from "react";
import { parse, format, addDays } from "date-fns";
import NewsCard from "@/entities/News/ui";

export default function NewsPage({searchParams}:{searchParams: any}) {
  const {start_date, end_date} = searchParams
  const [news,setNews] = useState<any[]>([])

  useEffect(()=>{
    try {
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

      // Выполняем запрос
      getNews(queryParams).then((res)=>{
        if (res.data) {
          console.log(res.data,"AUE RESPONSE")

          setNews(res.data);
        } else {
          setNews([]);
        }
      });
    } catch (error) {
      console.error("Ошибка при получении новостей:", error);
      setNews([]);
    }
  },[start_date, end_date])

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Новости</h1>
        <DatePicker/>
      </div>
      
      <div className="mt-6">
        {news.length > 0 ? (
          <div className="grid gap-4">
            {news.map((item, index) => (
              <NewsCard key={index} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Новости не найдены</p>
        )}
      </div>
    </div>
  )
}