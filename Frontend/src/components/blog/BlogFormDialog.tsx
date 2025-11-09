import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { BlogPost, PostTag, CreateBlogPostInput } from "@/types/blog";
import { getBlogPostById } from "@/services/blogService";

interface BlogFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  postId?: number;
  tags: PostTag[];
  onClose: () => void;
  onSave: (input: CreateBlogPostInput) => Promise<void>;
}

type FormDraft = {
  postId?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: number | null;
  isPublished: boolean;
  tagIds: number[];
};

const EMPTY_DRAFT: FormDraft = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  authorId: null,
  isPublished: false,
  tagIds: [],
};

export function BlogFormDialog({
  open,
  mode,
  postId,
  tags,
  onClose,
  onSave,
}: BlogFormDialogProps) {
  const [draft, setDraft] = useState<FormDraft>({ ...EMPTY_DRAFT });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "create") {
        setDraft({ ...EMPTY_DRAFT });
        setLoading(false);
      } else if (postId) {
        loadPost(postId);
      }
    }
  }, [open, mode, postId]);

  async function loadPost(id: number) {
    setLoading(true);
    try {
      const post = await getBlogPostById(id);
      const tagIds =
        post.tags
          ?.map((tagName) => {
            const tag = tags.find((t) => t.tagName === tagName);
            return tag?.tagId ?? tag?.id;
          })
          .filter((id): id is number => id !== undefined) ?? [];

      setDraft({
        postId: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content ?? "",
        excerpt: post.excerpt ?? "",
        authorId: post.authorId ?? null,
        isPublished: post.isPublished,
        tagIds,
      });
    } catch (e) {
      alert("Không thể tải thông tin bài viết. Vui lòng thử lại.");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!draft.title || !draft.slug || !draft.authorId) {
      alert("Tiêu đề, Slug và Tác giả là bắt buộc");
      return;
    }

    if (!draft.content) {
      alert("Nội dung là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const tagNames = draft.tagIds
        .map((id) => {
          const tag = tags.find((t) => (t.tagId !== undefined && t.tagId === id) || t.id === id);
          return tag?.tagName;
        })
        .filter((name): name is string => name !== undefined && name !== null);

      const input: CreateBlogPostInput = {
        title: draft.title,
slug: draft.slug,
        content: draft.content,
        excerpt: draft.excerpt || null,
        authorId: draft.authorId,
        isPublished: draft.isPublished,
        tagNames: tagNames,
      };

      await onSave(input);
      onClose();
    } catch (e) {
      alert("Lỗi khi lưu bài viết. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
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
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-neutral-500">Đang tải thông tin bài viết...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="my-post-slug"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="excerpt">Tóm tắt</Label>
              <Input
                id="excerpt"
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                placeholder="Tóm tắt ngắn gọn về bài viết"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="content">Nội dung *</Label>
              <textarea
                id="content"
                className="w-full min-h-[300px] rounded-md border border-input bg-background p-3 text-sm"
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="Nhập nội dung bài viết..."
              />
            </div>

            <div>
              <Label htmlFor="authorId">ID Tác giả *</Label>
              <Input
                id="authorId"
                type="number"
                value={draft.authorId ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
authorId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="VD: 1"
              />
            </div>

            <div className="col-span-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => {
                  const checked = draft.tagIds.includes(t.tagId ?? t.id);
                  return (
                    <label
                      key={t.tagId ?? t.id}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded border cursor-pointer hover:bg-neutral-50"
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          toggleTag(t.tagId ?? t.id, (e.target as HTMLInputElement).checked)
                        }
                      />
                      <span className="text-sm">{t.tagName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.isPublished}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      isPublished: (e.target as HTMLInputElement).checked,
                    }))
                  }
                />
                <span className="text-sm">Đã xuất bản</span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}