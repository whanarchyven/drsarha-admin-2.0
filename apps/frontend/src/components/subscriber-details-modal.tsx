'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Subscriber } from '@/entities/Subscriber/model/types';

interface SubscriberDetailsModalProps {
  subscriber: Subscriber;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriberDetailsModal({
  subscriber,
  isOpen,
  onClose,
}: SubscriberDetailsModalProps) {
  const getTariffBadgeColor = (tariff: string) => {
    switch (tariff) {
      case 'pro':
        return 'bg-blue-500';
      case 'smm':
        return 'bg-purple-500';
      case 'free':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Информация о подписчике</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`/placeholder.svg?height=64&width=64&text=${subscriber.email.charAt(0)}`}
              />
              <AvatarFallback>{subscriber.email.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-xl">{subscriber.fullName}</h3>
              <p className="text-muted-foreground">{subscriber.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">ID:</span>
              <span>{subscriber._id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Тариф:</span>
              <Badge className={getTariffBadgeColor(subscriber.tariff)}>
                {subscriber.tariff.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Подписка до:</span>
              <span>{formatDate(subscriber.subscribeTill)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Телефон:</span>
              <span>{subscriber.phone}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Город:</span>
              <span>{subscriber.city}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Место работы:</span>
              <span>{subscriber.workplace}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Должность:</span>
              <span>{subscriber.position}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Диплом:</span>
              <span>{subscriber.diploma}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Специализация:</span>
              <span>{subscriber.specialization}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Telegram:</span>
              <span>{subscriber.telegram}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
