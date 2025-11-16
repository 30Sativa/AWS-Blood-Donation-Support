export interface PostTag {
  id: number;                    // từ API response
  tagName: string;
  tagSlug: string;
  posts?: any[];                 // từ API response (có thể là array của posts)
  domainEvents?: any[];          // từ API response
  createdOn?: string;            // DATETIME2 (ISO)
  updateAt?: string | null;     // DATETIME2 (ISO)
  // Alias cho tương thích với code cũ
  tagId?: number;                // alias cho id
}

export interface IntroductionSection {
  title: string;
  content: string;
}

// Response wrapper từ backend
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Paginated response data
export interface PaginatedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// BlogPost từ API response
export interface BlogPost {
  id: number;                  // từ API response
  title: string;
  slug: string;
  content?: string;            // content từ API (string)
  excerpt?: string;
  authorId?: number;           // có thể không có trong response
  publishedAt?: string;        // DATETIME2 (ISO)
  isPublished: boolean;
  createdAt?: string;          // DATETIME2 (ISO)
  updatedAt?: string;         // DATETIME2 (ISO)
  tags?: string[];            // từ API: array of tag names (string[])
  imageUrl?: string;          // từ s3_attachments hoặc column
  authorName?: string;        // join từ user_profiles
}

// Internal type với introduction sections (để dùng trong UI)
export interface BlogPostWithSections extends Omit<BlogPost, 'content'> {
  introduction?: IntroductionSection[]; // để hiển thị trong UI
  postId: number; // alias cho id để tương thích với code cũ
}

/** Inputs used by the service layer - format gửi lên API */
export type CreateBlogPostInput = {
  title: string;
  slug: string;
  content: string;            // string thay vì introduction sections
  excerpt?: string | null;
  authorId: number;
  isPublished: boolean;
  publishedAt?: string | null;
  tagNames?: string[];        // array of tag names (string[])
  imageFile?: File | null;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;
