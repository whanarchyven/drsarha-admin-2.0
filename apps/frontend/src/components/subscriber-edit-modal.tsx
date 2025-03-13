'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subscriber } from '@/entities/Subscriber/model/types';

interface SubscriberEditModalProps {
  subscriber: Subscriber;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubscriber: Subscriber) => void;
}

type EditableSubscriber = Omit<Subscriber, 'password'> & { password?: string };

export function SubscriberEditModal({
  subscriber,
  isOpen,
  onClose,
  onSave,
}: SubscriberEditModalProps) {
  // Create a copy without the password field for editing
  const initialFormData: EditableSubscriber = { ...subscriber };
  delete initialFormData.password;

  const [formData, setFormData] = useState<EditableSubscriber>(initialFormData);

  const handleChange = (
    field: keyof EditableSubscriber,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add back the password field before saving
    const completeData = {
      ...formData,
      password: subscriber.password,
    } as Subscriber;
    onSave(completeData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование подписчика</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">ФИО</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workplace">Место работы</Label>
            <Input
              id="workplace"
              value={formData.workplace}
              onChange={(e) => handleChange('workplace', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diploma">Номер диплома</Label>
            <Input
              id="diploma"
              value={formData.diploma}
              onChange={(e) => handleChange('diploma', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Специализация</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input
              id="telegram"
              value={formData.telegram}
              onChange={(e) => handleChange('telegram', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscribeTill">Подписка до</Label>
            <Input
              id="subscribeTill"
              type="datetime-local"
              value={new Date(formData.subscribeTill)
                .toISOString()
                .slice(0, 16)}
              onChange={(e) =>
                handleChange(
                  'subscribeTill',
                  new Date(e.target.value).toISOString()
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tariff">Тариф</Label>
            <Select
              value={formData.tariff}
              onValueChange={(value) => handleChange('tariff', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="smm">SMM</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
