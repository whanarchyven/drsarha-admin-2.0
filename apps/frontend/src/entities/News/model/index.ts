export interface News {
  id: string;

  // Title
  title: string;
  title_translation_ai: string;
  title_translation_human: string;

  // Content
  content: string;

  translation_human: string;
  translation_ai: string;
  // Summary
  summary: string;
  summary_human: string;

  //State-flags
  isIndexed: boolean;
  isPublished: boolean;
  hasTranslation: boolean;
  hasDevComment: boolean;

  //URLs
  articleUrl: string;
  mainUrl: string;

  //Dates
  publishedDate: string;
  createdAt: string;
  updatedAt: string;

  //Categories
  category: string;
  subcategories: string[];

  //References
  references_human: string[];

  //Other
  tokenCount: {
    contentTokenCount: number;
    pdfTokenCount: number;
  };
  mongo_id: {
    $oid: string;
  };
}
