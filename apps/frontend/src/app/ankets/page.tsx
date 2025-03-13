export const revalidate = 0;
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllUsers } from '@/shared/api/users/getAllUsers';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import UsersTable from '@/widgets/users-table';
import { getAnkets } from '@/shared/api/subscribers/getAnkets';
import AnketsTable from '@/widgets/ankets-table';
export default async function UsersPage() {
  const ankets = await getAnkets();
  console.log(ankets);

  return (
    <div className="">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">Анкеты</p>
          <AnketsTable initialAnkets={ankets} />
        </div>
      </div>
    </div>
  );
}
