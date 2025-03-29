export const revalidate = 0;
export const dynamic = 'force-dynamic';
import { eden } from '@/features/eden/eden';
import EditArticleForm from '@/widgets/edit-article-form';

export default async function EditArticlePage({ params }: { params: any }) {
  const { id } = params;

  const article = await eden.editor.articles({ id: id }).get();
  console.log(article,"ARTICLE")

  if (article?.error) {
    return <div>Error: {article.error.value.message}</div>;
  }
  console.log(article);

  return (
    <div>
      <EditArticleForm article={article.data} />
    </div>
  );
}
