import { useEffect, useMemo, useState } from "react";
import type { BlogPost, PostTag, CreateBlogPostInput } from "@/types/blog";
import { createBlogPost, deleteBlogPost, listBlogPosts, listPostTags, updateBlogPost } from "@/services/blogService";
import { BlogTable } from "@/components/blog/BlogTable";
import { BlogSearchBar } from "@/components/blog/BlogSearchBar";
import { BlogFormDialog } from "@/components/blog/BlogFormDialog";
import { BlogViewDialog } from "@/components/blog/BlogViewDialog";

export default function ManageBlog() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPostId, setEditingPostId] = useState<number | undefined>();

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  // Load posts + tags
  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [p, t] = await Promise.all([listBlogPosts(), listPostTags()]);
      setPosts(p);
      setTags(t);
    } catch (e) {
      console.error(e);
      alert("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter posts based on query
  const filtered = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) => {
      const contentMatch = p.content?.toLowerCase().includes(q);
      const tagsText = p.tags?.some((tagName) => tagName.toLowerCase().includes(q));
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q) ||
        !!contentMatch ||
        !!tagsText
      );
    });
  }, [query, posts]);

  // Handlers
  function handleCreate() {
    setFormMode("create");
    setEditingPostId(undefined);
    setFormDialogOpen(true);
  }

  function handleEdit(post: BlogPost) {
    setFormMode("edit");
    setEditingPostId(post.id);
    setFormDialogOpen(true);
  }

  function handleView(post: BlogPost) {
    setViewingPost(post);
    setViewDialogOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((x) => x.id !== id));
      alert("Xóa bài viết thành công!");
      await loadData(true);
    } catch (e) {
console.error(e);
      alert("Xóa bài viết thất bại. Vui lòng thử lại.");
    }
  }

  async function handleSave(input: CreateBlogPostInput) {
    try {
      if (formMode === "create") {
        const created = await createBlogPost(input);
        setPosts((prev) => [created, ...prev]);
        alert("Tạo bài viết thành công!");
      } else if (editingPostId) {
        const updated = await updateBlogPost(editingPostId, input);
        setPosts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        alert("Cập nhật bài viết thành công!");
      }
      await loadData(true);
    } catch (e) {
      console.error(e);
      throw e; // Re-throw để BlogFormDialog xử lý
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Quản lý bài viết</h1>
      <p className="text-sm text-neutral-600">Quản lý và chỉnh sửa các bài viết blog.</p>

      <BlogSearchBar
        query={query}
        onQueryChange={setQuery}
        onRefresh={() => loadData(true)}
        onCreate={handleCreate}
        refreshing={refreshing}
      />

      <BlogTable
        posts={filtered}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BlogFormDialog
        open={formDialogOpen}
        mode={formMode}
        postId={editingPostId}
        tags={tags}
        onClose={() => setFormDialogOpen(false)}
        onSave={handleSave}
      />

      <BlogViewDialog
        post={viewingPost}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={handleEdit}
      />
    </div>
  );
}
