'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface SourcesListProps {
  initialSources?: string[];
  onChange?: (sources: string[]) => void;
}

export default function SourcesList({
  initialSources = [],
  onChange,
}: SourcesListProps) {
  const [sources, setSources] = useState<string[]>(initialSources);
  const [newSource, setNewSource] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddSource = () => {
    if (newSource.trim()) {
      const updatedSources = [...sources, newSource.trim()];
      setSources(updatedSources);
      setNewSource('');
      onChange?.(updatedSources);
    }
  };

  const handleRemoveSource = (index: number) => {
    const updatedSources = sources.filter((_, i) => i !== index);
    setSources(updatedSources);
    onChange?.(updatedSources);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSources = [...sources];
    const draggedItem = newSources[draggedIndex];

    // Remove the dragged item
    newSources.splice(draggedIndex, 1);
    // Insert it at the new position
    newSources.splice(index, 0, draggedItem);

    setSources(newSources);
    setDraggedIndex(index);
    onChange?.(newSources);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Список источников</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="Введите источник"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSource();
                }
              }}
            />
            <Button
              onClick={handleAddSource}
              variant="default"
              className="bg-blue-900 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          <div className="border rounded-md">
            {sources.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Нет добавленных источников
              </div>
            ) : (
              <ul className="divide-y">
                {sources.map((source, index) => (
                  <li
                    key={index}
                    className="flex items-center p-3 gap-2 hover:bg-slate-50"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}>
                    <div
                      className="cursor-grab p-1"
                      title="Перетащите для изменения порядка">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="flex-1">{source}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSource(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Удалить источник</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
