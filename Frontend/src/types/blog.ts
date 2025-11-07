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
  postId: number;              // BIGINT IDENTITY
  title: string;               // NVARCHAR(500)
  slug: string;                // NVARCHAR(500)
  introduction?: IntroductionSection[]; // optional sections
  excerpt?: string;            // NVARCHAR(1000)
  authorId: number;            // BIGINT
  publishedAt?: string;        // DATETIME2 (ISO)
  isPublished: boolean;        // BIT
  createdAt: string;           // DATETIME2 (ISO)
  updatedAt?: string;          // DATETIME2 (ISO)
  tags?: PostTag[];            // from post_tag_mappings
  imageUrl?: string;           // from s3_attachments or column
  authorName?: string;         // join from user_profiles
}

/** Inputs used by the service layer */
export type CreateBlogPostInput = {
  title: string;
  slug: string;
  introduction?: IntroductionSection[];
  excerpt?: string | null;
  authorId: number;
  isPublished: boolean;
  publishedAt?: string | null;
  tagIds?: number[];
  imageFile?: File | null;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;
