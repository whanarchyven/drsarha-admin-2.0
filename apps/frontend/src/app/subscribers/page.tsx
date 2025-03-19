'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubscriberDetailsModal } from '@/components/subscriber-details-modal';
import { SubscriberEditModal } from '@/components/subscriber-edit-modal';
import { SubscriberCard } from '@/entities/Subscriber/ui';
import { Pagination } from '@/shared/ui/pagination';
import { Subscriber } from '@/entities/Subscriber/model/types';
import { getAllAnkets } from '@/shared/api/subscribers/getAllAnkets';
import { editUser } from '@/shared/api/subscribers/editUser';
import { banUser } from '@/shared/api/subscribers/banUser';
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal';
import { renewSubscription } from '@/shared/api/subscribers/renewSubscription';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/shared/ui/confirmation-dialog';

import { changePassword } from '@/shared/api/users/changePassword';
import { SubscriptionPasswordChangeModal } from '@/components/subscription-password-change-modal';
import { eden } from '@/features/eden/eden';

// Mock data for subscribers

export default function SubscribersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [tariff, setTariff] = useState(searchParams.get('tariff') || '');

  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get('page') || '1')
  );
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tariff) params.set('tariff', tariff);
    params.set('page', currentPage.toString());

    // Проверяем, что URL действительно изменился, чтобы избежать лишних обновлений
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    const currentUrl = `${window.location.pathname}?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [search, tariff, currentPage, router, searchParams]);

  const handleOpenDetails = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubscription = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsRenewalModalOpen(true);
  };

  const openPassModal = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsPasswordModalOpen(true);
  };

  const handleBanUser = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsConfirmationModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Используем данные, полученные с сервера, вместо локальной пагинации
  const [totalPages, setTotalPages] = useState(1);
  const [currentItems, setCurrentItems] = useState<Subscriber[]>([]);

  const fetchSubscribers = async () => {
    getAllAnkets(currentPage, itemsPerPage, search, tariff).then((res) => {
      console.log(res, 'RES');
      setSubscribers(res.users || []);
      setCurrentItems(res.users || []);
      setTotalPages(res.pagination.totalPages || 1);
    });
  };

  useEffect(() => {
    fetchSubscribers();
    setSelectedSubscriber(null);
  }, [currentPage, itemsPerPage, search, tariff]);

  const handleRenewSubscription = async (plan: string) => {
    const renewal = await renewSubscription(
      selectedSubscriber?.email ?? '',
      plan
    );
    if (renewal) {
      toast.success('Подписка успешно обновлена');
      fetchSubscribers();
    } else {
      toast.error('Ошибка при обновлении подписки');
    }
    console.log(renewal, 'RENEWAL');
  };

  const handleChangePassword = async (password: string) => {
    console.log(password, selectedSubscriber);
    if (selectedSubscriber) {
      const result = await eden['main-backend']
        ['reset-pass']({ id: selectedSubscriber._id })
        .put({
          password: password,
        });
      console.log(result);
      if (result?.data.message) {
        toast.success('Пароль успешно изменён');
      } else {
        toast.error('Ошибка при смене пароля');
      }
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-8">Подписчики</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Поиск по email или имени"
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            value={tariff}
            onValueChange={(value) => {
              setCurrentPage(1);
              setTariff(value);
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Все тарифы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все тарифы</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="smm">SMM</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {currentItems.map((subscriber) => (
          <SubscriberCard
            key={subscriber._id}
            subscriber={subscriber}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEdit}
            onUpdateSubscription={handleUpdateSubscription}
            onBanUser={handleBanUser}
            onPasswordChange={openPassModal}
          />
        ))}
      </div>

      {subscribers?.length > 0 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <p className="text-center mt-8 text-muted-foreground">
          Подписчики не найдены
        </p>
      )}

      {selectedSubscriber && (
        <>
          <SubscriberDetailsModal
            subscriber={selectedSubscriber}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
          />
          <SubscriberEditModal
            subscriber={selectedSubscriber}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={async (updatedSubscriber) => {
              console.log('Save updated subscriber:', updatedSubscriber);
              const editedUser = await editUser(
                updatedSubscriber._id,
                updatedSubscriber
              );
              console.log(editedUser, 'EDITED USER');
              fetchSubscribers();
              setIsEditModalOpen(false);
            }}
          />
          <SubscriptionRenewalModal
            isOpen={isRenewalModalOpen}
            onClose={() => setIsRenewalModalOpen(false)}
            onRenew={handleRenewSubscription}
          />
          <ConfirmationDialog
            open={isConfirmationModalOpen}
            onOpenChange={setIsConfirmationModalOpen}
            onConfirm={async () => {
              const ban = await banUser(selectedSubscriber?._id ?? '');
              console.log(ban, 'BAN');
              if (ban) {
                toast.success('Пользователь успешно заблокирован');
                fetchSubscribers();
                setIsConfirmationModalOpen(false);
              } else {
                toast.error('Ошибка при блокировке пользователя');
              }
            }}
            itemName={selectedSubscriber?.email ?? ''}
            itemIdentifier={''}
            type="destructive"
            title="Заблокировать"
          />
          <SubscriptionPasswordChangeModal
            onPasswordChange={handleChangePassword}
            onClose={() => {
              setIsPasswordModalOpen(false);
            }}
            isOpen={isPasswordModalOpen}
          />
        </>
      )}
    </div>
  );
}
