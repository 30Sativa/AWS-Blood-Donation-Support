import type { BlogPost, PostTag, CreateBlogPostInput, UpdateBlogPostInput } from "@/types/blog";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function ensureOk(r: Response) {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const r = await fetch(`${API}/posts`);
  ensureOk(r);
  return r.json();
}

export async function listPostTags(): Promise<PostTag[]> {
  const r = await fetch(`${API}/tags`);
  ensureOk(r);
  return r.json();
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  if (input.imageFile instanceof File) {
    const form = new FormData();
    form.append("payload", new Blob([JSON.stringify({ ...input, imageFile: undefined })], { type: "application/json" }));
    form.append("imageFile", input.imageFile);
    const r = await fetch(`${API}/posts`, { method: "POST", body: form });
    ensureOk(r);
    return r.json();
  } else {
    const r = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    ensureOk(r);
    return r.json();
  }
}

export async function updateBlogPost(postId: number, input: UpdateBlogPostInput): Promise<BlogPost> {
  if (input.imageFile instanceof File) {
    const form = new FormData();
    form.append("payload", new Blob([JSON.stringify({ ...input, imageFile: undefined })], { type: "application/json" }));
    form.append("imageFile", input.imageFile);
    const r = await fetch(`${API}/posts/${postId}`, { method: "PUT", body: form });
    ensureOk(r);
    return r.json();
  } else {
    const r = await fetch(`${API}/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    ensureOk(r);
    return r.json();
  }
}

export async function deleteBlogPost(postId: number): Promise<void> {
  const r = await fetch(`${API}/posts/${postId}`, { method: "DELETE" });
  ensureOk(r);
}
