export const revalidate = 0;
export const dynamic = 'force-dynamic';
import { eden } from '@/features/eden/eden';
import EditNewsForm from '@/widgets/edit-news-form';

export default async function EditNewsPage({ params }: { params: any }) {
  const { id } = params;

  const news = await eden.editor.news({ id: id }).get();
  console.log(news,"NEWS")

  if (news?.error) {
    return <div>Error: {news.error.value.message}</div>;
  }
  console.log(news);

  return (
    <div>
      <EditNewsForm news={news.data} />
    </div>
  );
}


