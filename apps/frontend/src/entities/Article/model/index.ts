export interface Article {
  // Языки
  languages: string[];

  // Заголовок
  title: {
    en: {
      ai: string;
      human: string;
    };
    ru: {
      ai: string;
      human: string;
    };
    raw: string;
  };

  // Содержимое
  content: {
    en: {
      ai: string;
      human: string;
    };
    ru: {
      ai: string;
      human: string;
    };
    raw: string;
  };

  // Краткое содержание
  summary: {
    ru: {
      ai: string;
      human: string;
    };
  };

  // Метаданные
  meta: {
    isIndexed: boolean;
    isPublished: boolean;
    isDeleted: boolean;
    hasTranslation: boolean;
    hasDevComment: boolean;
    isClinicalCase: boolean;
  };

  // URL статьи
  articleUrl: string;

  // Даты
  dates: {
    published: string;
    created: string;
    updated: string;
  };

  // Категория и подкатегория
  category: string;
  subcategory: string;

  // Ссылки
  references: string[];

  // DOI
  doi: string;

  // Название издателя
  publisherName: string;

  // Авторы
  authors: string[];

  // Дополнительные данные
  addons: {
    mainUrl?: string;
    pdf_text?: string;
    isDeletedAt?: string;
  };

  // Итерация парсера
  parserIteration: number;

  // Идентификатор

  _id: string;
}
