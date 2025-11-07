export interface PostTag {
  tagId: number;
  tagName: string;
  tagSlug: string;
}

export interface IntroductionSection {
  title: string;
  content: string;
}

export interface BlogPost {
  postId: number;              // BIGINT IDENTITY - Mã bài viết
  title: string;               // NVARCHAR(500) - Tiêu đề
  slug: string;                // NVARCHAR(500) - Đường dẫn SEO
  // content: string;             // NVARCHAR(MAX) - Nội dung đầy đủ
  introduction?: IntroductionSection[]; // Sections with title and content
  excerpt?: string;            // NVARCHAR(1000) - Tóm tắt (thay vì description)
  authorId: number;            // BIGINT - Mã tác giả
  publishedAt?: string;        // DATETIME2 - Ngày xuất bản (ISO date string)
  isPublished: boolean;        // BIT - Trạng thái đã publish
  createdAt: string;           // DATETIME2 - Thời điểm tạo (ISO date string)
  updatedAt?: string;          // DATETIME2 - Thời điểm cập nhật (ISO date string)
  tags?: PostTag[];           // Tags từ post_tag_mappings
  imageUrl?: string;          // Featured image (lấy từ s3_attachments hoặc thêm column)
  authorName?: string;        // Tên tác giả (join từ user_profiles)
}
