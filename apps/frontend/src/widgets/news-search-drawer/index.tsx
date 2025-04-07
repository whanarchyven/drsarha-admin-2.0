'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { getNews } from '@/shared/api/news/getNews';
import Link from 'next/link';
interface SearchResult {
  id: string;
  title: string;
}

export function NewsSearchDrawer() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        open
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const fetchResults = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getNews({ search: query, limit: 10, page: 0 });
      setResults(
        data.data.map((item: any) => ({ id: item._id, title: item.title }))
      );
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch search results when query changes

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchResults();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Поиск</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 z-50 bg-white shadow-lg"
            ref={containerRef}>
            <div className="mx-auto w-full max-w-3xl">
              <div className="p-4">
                <div className="relative">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                    <Input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handlePressEnter}
                      placeholder="Запрос от пользователя"
                      className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <div className="flex items-center pr-2">
                      {query && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuery('')}
                          className="h-8 w-8 mr-1">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Очистить</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  ) : results.length > 0 ? (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-lg">
                      <ul className="py-2 flex flex-col gap-2 max-h-[300px] overflow-y-scroll">
                        {results.map((result) => (
                          <Link
                            key={result.id}
                            href={`/news/${result.id}/edit`}
                            className="px-4 py-2 hover:bg-muted cursor-pointer">
                            {result.title.raw}
                          </Link>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p>Ничего не найдено</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
