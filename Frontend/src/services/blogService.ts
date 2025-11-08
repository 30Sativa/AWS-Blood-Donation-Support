import type {
  BlogPost,
  PostTag,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  IntroductionSection,
} from "@/types/blog";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/* ----------------- Helpers ----------------- */
function ensureOk(r: Response) {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
}

const toBool = (v: any) =>
  typeof v === "boolean" ? v : v === 1 || v === "1" || String(v).toLowerCase() === "true";

const toNum = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toStrUndef = (v: any): string | undefined =>
  v == null ? undefined : String(v);

const toIsoOrNull = (v: any): string | null | undefined => {
  if (v === null) return null;
  if (v === undefined) return undefined;
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  } catch {
    return undefined;
  }
};

function parseIntroduction(raw: any): IntroductionSection[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw as IntroductionSection[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function mapTag(raw: any): PostTag {
  return {
    tagId: toNum(raw?.tagId ?? raw?.id),
    tagName: String(raw?.tagName ?? raw?.name ?? ""),
    tagSlug: String(raw?.tagSlug ?? raw?.slug ?? ""),
  };
}

function mapPost(raw: any): BlogPost {
  const tagsRaw = Array.isArray(raw?.tags)
    ? raw.tags
    : Array.isArray(raw?.tagList)
    ? raw.tagList
    : [];

  return {
    postId: toNum(raw?.postId ?? raw?.id),
    title: String(raw?.title ?? ""),
    slug: String(raw?.slug ?? raw?.seoSlug ?? ""),
    introduction: parseIntroduction(raw?.introduction),
    excerpt: toStrUndef(raw?.excerpt),
    authorId: toNum(raw?.authorId ?? raw?.author?.id),
    publishedAt:
      toIsoOrNull(raw?.publishedAt) ??
      toIsoOrNull(raw?.publishDate) ??
      undefined,
    isPublished: toBool(raw?.isPublished ?? raw?.published),
    createdAt: toIsoOrNull(raw?.createdAt ?? raw?.created) ?? new Date().toISOString(),
    updatedAt: toIsoOrNull(raw?.updatedAt ?? raw?.updated) ?? undefined,
    tags: tagsRaw.map(mapTag),
    imageUrl: toStrUndef(raw?.imageUrl) ?? toStrUndef(raw?.coverUrl),
    authorName: toStrUndef(raw?.authorName ?? raw?.author?.name),
  };
}

/** Một số backend trả mảng, một số trả {items,...}. Hàm này luôn trả mảng theo chữ ký cũ. */
async function readAsPosts(r: Response): Promise<BlogPost[]> {
  ensureOk(r);
  const data = await r.json();
  if (Array.isArray(data)) return data.map(mapPost);
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
  return items.map(mapPost);
}

/** Cho phép field optional khi update; không gây lỗi TS nữa. */
function normalizePublishFields<T extends { isPublished?: boolean; publishedAt?: string | null }>(obj: T): T {
  // chỉ xử lý khi field có mặt
  if (obj.isPublished === true && !obj.publishedAt) {
    obj.publishedAt = new Date().toISOString();
  }
  if (obj.isPublished === false && obj.publishedAt) {
    obj.publishedAt = null;
  }
  return obj;
}

/* ----------------- Public API (giữ nguyên chữ ký cũ) ----------------- */

export async function listBlogPosts(): Promise<BlogPost[]> {
  const r = await fetch(`${API}/posts`);
  return readAsPosts(r);
}

export async function listPostTags(): Promise<PostTag[]> {
  const r = await fetch(`${API}/tags`);
  ensureOk(r);
  const data = await r.json();
  // chịu cả dạng ["tag-a"...] hoặc [{tagName, tagSlug}...]
  if (Array.isArray(data) && data.length && typeof data[0] !== "object") {
    return (data as any[]).map((s) => ({ tagId: 0, tagName: String(s), tagSlug: String(s) }));
  }
  return (Array.isArray(data) ? data : []).map(mapTag);
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const payload = normalizePublishFields({ ...input });

  if (payload.imageFile instanceof File || (typeof Blob !== "undefined" && payload.imageFile instanceof Blob)) {
    const form = new FormData();
    const payloadJson = { ...payload, imageFile: undefined } as Omit<typeof payload, "imageFile">;
    form.append("payload", new Blob([JSON.stringify(payloadJson)], { type: "application/json" }));
    // @ts-ignore - File | Blob
    form.append("imageFile", payload.imageFile);

    const r = await fetch(`${API}/posts`, { method: "POST", body: form });
    ensureOk(r);
    const data = await r.json();
    return mapPost(data);
  } else {
    const r = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    ensureOk(r);
    const data = await r.json();
    return mapPost(data);
  }
}

export async function updateBlogPost(postId: number, input: UpdateBlogPostInput): Promise<BlogPost> {
  const payload = normalizePublishFields({ ...input });

  if (payload.imageFile instanceof File || (typeof Blob !== "undefined" && payload.imageFile instanceof Blob)) {
    const form = new FormData();
    const payloadJson = { ...payload, imageFile: undefined } as Omit<typeof payload, "imageFile">;
    form.append("payload", new Blob([JSON.stringify(payloadJson)], { type: "application/json" }));
    // @ts-ignore - File | Blob
    form.append("imageFile", payload.imageFile);

    const r = await fetch(`${API}/posts/${postId}`, { method: "PUT", body: form });
    ensureOk(r);
    const data = await r.json();
    return mapPost(data);
  } else {
    const r = await fetch(`${API}/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    ensureOk(r);
    const data = await r.json();
    return mapPost(data);
  }
}

export async function deleteBlogPost(postId: number): Promise<void> {
  const r = await fetch(`${API}/posts/${postId}`, { method: "DELETE" });
  ensureOk(r);
}
