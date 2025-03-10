"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { News } from "../model";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ResizableContainer from "@/components/resizable-container";

interface NewsCardProps extends News {}

const NewsCard = (props: NewsCardProps) => {
    const [isEnglish, setIsEnglish] = useState(true);
    
    const displayTitle = isEnglish ? props.title : props.title_translation_human??'';
    const displayContent = isEnglish ? props.content : props.translation_human??'';


    return (
        <Card className="w-full overflow-hidden">
            <CardHeader>
                <CardTitle>
                    <div className="flex items-start justify-between gap-12">
                        <p className="text-lg font-bold">{displayTitle}</p>
                        <div className="flex items-center gap-2">
                            <p>RU</p>
                            <Switch checked={isEnglish} onCheckedChange={setIsEnglish} />
                            <p>EN</p>
                        </div>
                    </div>
                </CardTitle>
                <CardContent className="p-0">
                    <div className="w-full my-4 flex flex-col gap-2">
                        <p className="text-sm font-bold italic">Контент</p>
                        <div className="border-2 border-gray-200 rounded-md p-2">
                            <ResizableContainer>
                                <p>{displayContent}</p>
                            </ResizableContainer>
                        </div>
                    </div>
                    
                </CardContent>
            </CardHeader>
        </Card>
    )
}

export default NewsCard;