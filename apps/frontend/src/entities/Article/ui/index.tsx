"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Article } from "../model";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ResizableContainer from "@/components/resizable-container";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { marked } from "marked";

// Функция для обработки markdown текста
const processMarkdownText = (text: string) => {
    if (!text) return '';
    
    // Если текст приходит в виде JSON-строки, парсим его
    if (text.startsWith('"') && text.endsWith('"')) {
        try {
            return JSON.parse(text);
        } catch (e) {
            // Если парсинг не удался, возвращаем исходный текст
            return text;
        }
    }
    
    // Заменяем строковые представления символов \n на реальные переносы строк
    return text.replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\\\/g, '\\')
              .replace(/\\"/g, '"');
};

interface ArticleCardProps extends Article {}

const ArticleCard = (props: ArticleCardProps) => {
    const [isEnglish, setIsEnglish] = useState(true);
    
    const displayTitle = isEnglish ? props.title : props.title_translation_human??'';
    // Обрабатываем текст перед отображением
    const displayContent = isEnglish ? props.pdf_text : props.pdf_text_translation_human??'';

    const isTranslated=props.pdf_text_translation_ai?.length>0;
    const hasClinicCase=props.is_clinic_case;

    const displaySummary=props.pdf_text_summary_human??props.pdf_text_summary_ai;


    return (
        <Card className="w-full overflow-hidden border-cBlack border-2">
            <CardHeader>
                <CardTitle>
                    <div className="flex items-start justify-between gap-12">
                        <p className="text-lg font-bold">{displayTitle}</p>
                        {props.isPDFTranslationIndexed&&<div className="flex items-center gap-2">
                            <p>RU</p>
                            <Switch checked={isEnglish} onCheckedChange={setIsEnglish} />
                            <p>EN</p>
                        </div>}
                        
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="flex items-center text-cBlack gap-4">
                        <p className="text-sm font-bold ">{format(new Date(props.publishedDate), 'dd.MM.yyyy')}</p>
                        <a href={props.mainUrl} target="_blank" className="text-sm underline font-bold cursor-pointer">источник</a>
                        <Badge variant={props.subcategory? 'info' : 'secondary'}>
                            {props.subcategory??'Без категории'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 my-4">
                        <Badge variant={isTranslated ? 'success' : 'secondary'}>
                            {isTranslated ? 'Переведено' : 'Не переведено'} 
                        </Badge>
                        <Badge variant={props.isPublished ? 'success' : 'secondary'}>
                            {props.isPublished ? 'Опубликовано' : 'Не опубликовано'}
                        </Badge>
                        <Badge variant={hasClinicCase ? 'success' : 'secondary'}>
                            {hasClinicCase ? 'Клинический случай' : 'Не клинический случай'}
                        </Badge>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 markdown-content whitespace-pre-line">
                    <div className="w-full my-4 flex flex-col gap-2">
                        <p className="text-sm font-bold italic">Контент</p>
                        <div className="border-2 border-gray-200 rounded-md p-2">
                            <ResizableContainer>
                                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(displayContent) }}>

                                </div>
                            </ResizableContainer>
                        </div>
                    </div>
                    {displaySummary&&displaySummary.length>0&&<div className="w-full my-4 flex flex-col gap-2">
                        <p className="text-sm font-bold italic">Саммари</p>
                        <div className="border-2 border-gray-200 rounded-md p-2">
                            <ResizableContainer>
                                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(displaySummary) }}>

                                </div>
                            </ResizableContainer>
                        </div>
                    </div>}
                    
                </CardContent>
        </Card>
    )
}

export default ArticleCard;