'use client';

import { useState } from 'react';

import {
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Trash2,
  Check,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Subscriber } from '@/entities/Subscriber/model/types';
import { ConfirmationDialog } from '@/shared/ui/confirmation-dialog';
import { approveAnket } from '@/shared/api/subscribers/approveAnket';
import { deleteSubscriber } from '@/shared/api/subscribers/deleteSubscriber';
interface AnketsTableProps {
  initialAnkets: Subscriber[];
}

export default function AnketsTable({ initialAnkets }: AnketsTableProps) {
  console.log(initialAnkets, 'initialAnkets');
  const [ankets, setAnkets] = useState<Subscriber[]>(initialAnkets);

  const [selectedUser, setSelectedUser] = useState<Subscriber | null>(null);

  // Новое состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  // Form states

  const handleDelete = async (userId: string) => {
    try {
      await deleteSubscriber(userId);
      setAnkets(ankets.filter((anket) => anket._id !== userId));
      setDeleteDialogOpen(false);
      toast.success('Анкета успешно удалена');
    } catch (error) {
      toast.error('Ошибка при удалении анкеты');
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveAnket(userId);
      setAnkets(ankets.filter((anket) => anket._id !== userId));
      setApproveDialogOpen(false);
      toast.success('Анкета успешно подтверждена');
    } catch (error) {
      toast.error('Ошибка при подтверждении анкеты');
    }
  };

  // Функция для открытия диалога удаления
  const openDeleteDialog = (user: Subscriber) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const approveDialog = (user: Subscriber) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Город</TableHead>
              <TableHead>Место работы</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Диплом</TableHead>
              <TableHead>Специализация</TableHead>
              <TableHead className="sticky right-0 bg-white z-10 w-[120px]">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ankets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              ankets.map((anket) => (
                <TableRow key={anket._id}>
                  <TableCell>{anket.fullName}</TableCell>
                  <TableCell>{anket.email}</TableCell>
                  <TableCell>{anket.phone}</TableCell>
                  <TableCell>{anket.telegram}</TableCell>
                  <TableCell>{anket.city}</TableCell>
                  <TableCell>{anket.workplace}</TableCell>
                  <TableCell>{anket.position}</TableCell>
                  <TableCell>{anket.diploma}</TableCell>
                  <TableCell>{anket.specialization}</TableCell>
                  <TableCell className="sticky right-0 bg-white z-10 flex gap-2">
                    <Button
                      variant="success"
                      size="icon"
                      onClick={() => approveDialog(anket)}
                      aria-label="Подтвердить анкету">
                      <Check className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(anket)}
                      aria-label="Удалить анкету">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Используем наш новый компонент DeleteConfirmationDialog */}
      <ConfirmationDialog
        type="destructive"
        title="Удалить"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedUser && handleDelete(selectedUser._id)}
        itemName="анкету"
        itemIdentifier={selectedUser?.fullName || ''}
      />
      <ConfirmationDialog
        type="success"
        title="Подтвердить"
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onConfirm={() => selectedUser && handleApprove(selectedUser._id)}
        itemName="анкету"
        itemIdentifier={selectedUser?.fullName || ''}
      />
    </>
  );
}
