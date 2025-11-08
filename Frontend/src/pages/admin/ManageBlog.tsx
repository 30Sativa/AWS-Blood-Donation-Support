import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import type { BlogPost, PostTag, IntroductionSection, CreateBlogPostInput } from "@/types/blog";
import { createBlogPost, deleteBlogPost, listBlogPosts, listPostTags, updateBlogPost } from "@/services/blogService";

type Mode = "create" | "edit";

type FormDraft = {
  postId?: number;
  title: string;
  slug: string;
  excerpt: string;
  introduction: IntroductionSection[];
  authorId: number | null;
  isPublished: boolean;
  publishedAt: string | null; // ISO
  tagIds: number[];
  imageFile: File | null;
};

const EMPTY_DRAFT: FormDraft = {
  title: "",
  slug: "",
  excerpt: "",
  introduction: [],
  authorId: null,
  isPublished: false,
  publishedAt: null,
  tagIds: [],
  imageFile: null,
};

export default function ManageBlog() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<FormDraft>({ ...EMPTY_DRAFT });

  // Load posts + tags
  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([listBlogPosts(), listPostTags()]);
        setPosts(p);
        setTags(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) => {
      const intro = p.introduction?.some(
        (s) => s.title?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)
      );
      const tagsText = p.tags?.some((t) => t.tagName.toLowerCase().includes(q) || t.tagSlug.toLowerCase().includes(q));
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q) ||
        !!intro ||
        !!tagsText
      );
    });
  }, [query, posts]);

  function openCreate() {
    setMode("create");
    setDraft({ ...EMPTY_DRAFT });
    setOpen(true);
  }

  function openEdit(p: BlogPost) {
    setMode("edit");
    setDraft({
      postId: p.postId,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      introduction: p.introduction ?? [],
      authorId: p.authorId,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt ?? null,
      tagIds: p.tags?.map((t) => t.tagId) ?? [],
      imageFile: null,
    });
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setSaving(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // auto slug nếu để trống
      const slug = draft.slug?.trim() || makeSlug(draft.title);

      if (!draft.title || !slug || !draft.authorId) {
        alert("Title, Slug và Author là bắt buộc");
        return;
      }

      if (mode === "create") {
        const input: CreateBlogPostInput = {
          title: draft.title,
          slug,
          introduction: draft.introduction,
          excerpt: draft.excerpt || null,
          authorId: draft.authorId,
          isPublished: draft.isPublished,
          publishedAt: draft.publishedAt,
          tagIds: draft.tagIds,
          imageFile: draft.imageFile ?? undefined,
        };
        const created = await createBlogPost(input);
        setPosts((prev) => [created, ...prev]);
      } else {
        const updated = await updateBlogPost(draft.postId!, {
          title: draft.title,
          slug,
          introduction: draft.introduction,
          excerpt: draft.excerpt || null,
          authorId: draft.authorId!,
          isPublished: draft.isPublished,
          publishedAt: draft.publishedAt,
          tagIds: draft.tagIds,
          imageFile: draft.imageFile ?? undefined,
        });
        setPosts((prev) => prev.map((x) => (x.postId === updated.postId ? updated : x)));
      }

      closeDialog();
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(postId: number) {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteBlogPost(postId);
      setPosts((prev) => prev.filter((x) => x.postId !== postId));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  }

  function addSection() {
    setDraft((d) => ({ ...d, introduction: [...d.introduction, { title: "", content: "" }] }));
  }

  function updateSection(idx: number, patch: Partial<IntroductionSection>) {
    setDraft((d) => {
      const next = [...d.introduction];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, introduction: next };
    });
  }

  function removeSection(idx: number) {
    setDraft((d) => {
      const next = [...d.introduction];
      next.splice(idx, 1);
      return { ...d, introduction: next };
    });
  }

  function toggleTag(tagId: number, checked: boolean) {
    setDraft((d) => {
      const set = new Set(d.tagIds);
      if (checked) set.add(tagId);
      else set.delete(tagId);
      return { ...d, tagIds: Array.from(set) };
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Admin</h1>
      <p className="text-sm text-neutral-600">Manage users, articles.</p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, slugs, tags..."
            className="pl-9 bg-white"
          />
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Table */}
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">STT</TableHead> {/* NEW */}
              <TableHead className="w-[34%]">Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Operation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((p, i) => (
                <TableRow key={p.postId} className="hover:bg-neutral-50">
                  <TableCell className="text-center">{i + 1}</TableCell> {/* NEW */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-8 w-8 rounded object-cover" /> : null}
                      <div>
                        <div>{p.title}</div>
                        <div className="text-xs text-neutral-500">{p.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{p.authorName ?? `#${p.authorId}`}</TableCell>
                  <TableCell>{p.publishedAt ? new Date(p.publishedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <span className={p.isPublished ? "text-green-600" : "text-neutral-500"}>
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-700">
                    {p.tags?.length ? p.tags.map((t) => t.tagName).join(", ") : "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(p.postId)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                  No posts match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Helper panel – Prepare the lesson */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Prepare the lesson</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 space-y-1">
          <p className="font-medium text-neutral-800">Prepare the lesson</p>
          <p>Select a lesson to edit or click "Create new lesson".</p>
          <p className="text-xs text-neutral-500">
            BR-02: There is a version history for restoration (hint: connect to DB/CMS to save history).
          </p>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Post" : "Edit Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    title: e.target.value,
                    slug: d.slug || makeSlug(e.target.value),
                  }))
                }
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="my-post-slug"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-start justify-between">
                <Label>Introduction Sections</Label>
                <Button variant="secondary" size="sm" onClick={addSection}>
                  Add Section
                </Button>
              </div>

              <div className="mt-2 space-y-3">
                {draft.introduction.map((sec, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={sec.title}
                          onChange={(e) => updateSection(i, { title: e.target.value })}
                          placeholder="Section title"
                        />
                      </div>
                      <div>
                        <Label>Actions</Label>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" onClick={() => removeSection(i)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Content</Label>
                      <textarea
                        className="w-full min-h-[120px] rounded-md border border-input bg-background p-2 text-sm"
                        value={sec.content}
                        onChange={(e) => updateSection(i, { content: e.target.value })}
                        placeholder="Section content"
                      />
                    </div>
                  </div>
                ))}
                {draft.introduction.length === 0 && (
                  <p className="text-sm text-neutral-500">No sections yet. Click “Add Section”.</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="authorId">Author ID</Label>
              <Input
                id="authorId"
                type="number"
                value={draft.authorId ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, authorId: e.target.value ? Number(e.target.value) : null }))
                }
                placeholder="e.g. 42"
              />
            </div>

            <div>
              <Label htmlFor="cover">Cover image (optional)</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => setDraft((d) => ({ ...d, imageFile: e.target.files?.[0] ?? null }))}
              />
            </div>

            <div className="col-span-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => {
                  const checked = draft.tagIds.includes(t.tagId);
                  return (
                    <label key={t.tagId} className="inline-flex items-center gap-2 px-2 py-1 rounded border">
                      <Checkbox
                        checked={checked}
                        onChange={(e) => toggleTag(t.tagId, (e.target as HTMLInputElement).checked)}
                      />
                      <span className="text-sm">{t.tagName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.isPublished}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, isPublished: (e.target as HTMLInputElement).checked }))
                  }
                />
                <span className="text-sm">Published</span>
              </label>

              <div>
                <Label htmlFor="publishedAt">Published at (UTC)</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={draft.publishedAt ? toLocalInput(draft.publishedAt) : ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function makeSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
