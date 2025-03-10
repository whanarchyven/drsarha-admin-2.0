import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Subscriber } from "../model/types"
import clsx from "clsx"
import { InfoIcon, PencilIcon, LockIcon, RefreshCcwIcon, BanIcon } from "lucide-react"


interface SubscriberCardProps {
  subscriber: Subscriber
  onOpenDetails: (subscriber: Subscriber) => void
  onOpenEdit: (subscriber: Subscriber) => void
  onUpdateSubscription: (subscriber: Subscriber) => void
  onBanUser: (subscriber: Subscriber) => void,
  onPasswordChange:(subscriber: Subscriber)=>void
}

export function SubscriberCard({
  subscriber,
  onOpenDetails,
  onOpenEdit,
  onUpdateSubscription,
  onBanUser, onPasswordChange
}: SubscriberCardProps) {
  const getTariffBadgeColor = (tariff: string) => {
    switch (tariff) {
      case "pro":
        return "bg-blue-500"
      case "smm":
        return "bg-purple-500"
      case "free":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  const tariff = new Date(subscriber.subscribeTill) > new Date() ? subscriber.tariff : "free"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={subscriber.avatar} />
            <AvatarFallback className="uppercase">{subscriber.email.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-lg">{subscriber.fullName}</h3>
            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
          </div>
        </div>
        <Button className="rounded-full p-2" variant="outline" size="sm" onClick={() => onOpenDetails(subscriber)}>
         <InfoIcon className="w-4 h-4" />
        </Button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Тариф:</span>
            <Badge className={getTariffBadgeColor(tariff)}>{tariff.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Подписка до:</span>
            <span className={clsx("text-sm font-bold",tariff==="free" && "text-red-500")}>{formatDate(subscriber.subscribeTill)}</span>
          </div>
          
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2 p-6 pt-0">
        <Button variant="default" size="sm" onClick={() => onOpenEdit(subscriber)}>
            <PencilIcon className="w-4 h-4" />
          Редактировать
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" variant="outline" size="sm" onClick={() => onPasswordChange(subscriber)}>
          <LockIcon className="w-4 h-4" />
          Сменить пароль
        </Button>
        <Button variant="success" size="sm" onClick={() => onUpdateSubscription(subscriber)}>
          <RefreshCcwIcon className="w-4 h-4" />
          Обновить подписку
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onBanUser(subscriber)}>
          <BanIcon className="w-4 h-4" />
          Забанить
        </Button>
      </CardFooter>
    </Card>
  )
}

