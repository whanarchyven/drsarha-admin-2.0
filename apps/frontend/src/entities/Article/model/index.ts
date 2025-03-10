export interface Article {
    id: string;

    // Title
    title: string;
    title_translation_ai: string;
    title_translation_human: string;
    titleIndexedStatus: boolean;

    // Content
    content: string;
    pdf_text: string;
    pdf_text_translation_human: string;
    pdf_text_translation_ai: string;
    
    // Translations
    translation_ai: string;
    
    // Summaries
    summary_ai: string;
    pdf_text_summary_ai: string;
    pdf_text_summary_human: string;
    
    // State-flags
    isIndexed: boolean;
    isPublished: boolean;
    isPublishedUpdatedAt: string;
    isTranslationIndexed?: boolean;
    isPDFTranslationIndexed?: boolean;
    
    
    // URLs
    articleUrl: string;
    mainUrl: string;
    
    // Dates
    publishedDate: string;
    createdAt: string;
    updatedAt: string;
    
    // Categories
    category: string;
    subcategory: string;
    
    // Authors
    authors: string[];
    
    // References
    references: string[] | any;
    
    // Parser info
    parserIteration: number;

    is_clinic_case?:boolean;
    
    // Other
    mongo_id?: {
        $oid: string;
    };
}
