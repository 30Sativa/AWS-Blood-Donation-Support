/** ID tạm thời cho phép chuyển dần nếu backend đôi lúc trả string */
export type IdLike = string | number;

/** Thẻ gắn với bài viết */
export interface PostTag {
  tagId: number;       // BIGINT -> hiện dùng number để giữ tương thích
  tagName: string;
  tagSlug: string;
}

/** Mục giới thiệu (có thể là markdown / html tuỳ bạn) */
export interface IntroductionSection {
  title: string;
  content: string;
}

/** Bản ghi bài viết trên FE */
export interface BlogPost {
  postId: number;              // BIGINT IDENTITY
  title: string;               // NVARCHAR(500)
  slug: string;                // NVARCHAR(500)
  introduction?: IntroductionSection[]; // optional sections
  excerpt?: string;            // NVARCHAR(1000)
  authorId: number;            // BIGINT
  publishedAt?: string | null; // DATETIME2 (ISO) - cho phép null khi chưa publish
  isPublished: boolean;        // BIT
  createdAt: string;           // DATETIME2 (ISO)
  updatedAt?: string;          // DATETIME2 (ISO)
  tags?: PostTag[];            // from post_tag_mappings
  imageUrl?: string;           // from s3_attachments or column
  authorName?: string;         // join from user_profiles
}

/** Input khi tạo bài viết (service layer sử dụng) */
export type CreateBlogPostInput = {
  title: string;
  slug: string;
  introduction?: IntroductionSection[];
  excerpt?: string | null;
  authorId: number;                 // nếu BE lấy từ token có thể bỏ ở service
  isPublished: boolean;
  publishedAt?: string | null;      // bắt buộc khi isPublished = true (check ở service)
  tagIds?: number[];                // map sang bảng post_tag_mappings
  imageFile?: File | Blob | null;   // FE-only; nếu upload tách bước có thể bỏ
};

/** Input khi cập nhật: tuỳ API, thường cần postId trong URL thay vì body */
export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

/* ------------------------------------------------------------------
 * Các type tiện ích (không bắt buộc dùng) để tăng độ an toàn logic
 * ------------------------------------------------------------------ */

/** Trạng thái bài viết dạng hẹp – dùng khi bạn muốn siết chặt logic ở form/editor */
export type BlogPostDraft = BlogPost & { isPublished: false; publishedAt?: null | undefined };
export type BlogPostPublished = BlogPost & { isPublished: true; publishedAt: string };

/** Payload dạng hẹp tương ứng cho create/update (tuỳ nhu cầu có thể dùng) */
export type CreateBlogPostDraft = Omit<CreateBlogPostInput, "isPublished" | "publishedAt"> & {
  isPublished: false;
  publishedAt?: null | undefined;
};
export type CreateBlogPostPublished = Omit<CreateBlogPostInput, "isPublished" | "publishedAt"> & {
  isPublished: true;
  publishedAt: string;
};
