import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
}: PaginationProps) {
  // Функция для создания массива номеров страниц с учетом эллипсисов
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= (limit ?? 7)) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pageNumbers.push(1);

      // Если текущая страница близка к началу
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
      // Если текущая страница близка к концу
      else if (currentPage >= totalPages - 3) {
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
      // Если текущая страница где-то в середине
      else {
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Предыдущая страница</span>
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              size="icon"
              disabled>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Больше страниц</span>
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page as number)}>
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Следующая страница</span>
      </Button>
    </div>
  );
}

export default Pagination;
