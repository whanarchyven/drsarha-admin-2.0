export const revalidate = 0;

import { getStack } from '@/shared/api/telegram/getStack';
import TelegramArticles, { TelegramArticle } from '@/widgets/telegram-articles';
export default async function UsersPage() {
  const stack = await getStack();

  return (
    <div className="">
      <div className="flex flex-col gap-4">
        <TelegramArticles
          initialArticles={stack as unknown as TelegramArticle[]}
        />
      </div>
    </div>
  );
}
