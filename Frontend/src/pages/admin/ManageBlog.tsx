import { useEffect, useMemo, useState } from "react";
import type { BlogPost, PostTag, CreateBlogPostInput } from "@/types/blog";
import { createBlogPost, deleteBlogPost, listBlogPosts, listPostTags, updateBlogPost } from "@/services/blogService";
import { BlogTable } from "@/components/blog/BlogTable";
import { BlogSearchBar } from "@/components/blog/BlogSearchBar";
import { BlogFormDialog } from "@/components/blog/BlogFormDialog";
import { BlogViewDialog } from "@/components/blog/BlogViewDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "react-toastify";


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

  // 
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      toast.error("Unable to load data. Please try again.");
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
  // (A) THAY THẾ hàm 'handleDelete' cũ. Hàm này giờ chỉ *mở* dialog.
  function handleDelete(id: number) {
    const postToDelete = posts.find((p) => p.id === id);
    if (!postToDelete) return;

    setDeletingPost(postToDelete);
    setConfirmOpen(true);
  }

  // (B) THÊM hàm 'handleConfirmDelete' để xử lý logic khi bấm "Xóa"
  async function handleConfirmDelete() {
    if (!deletingPost) return;

    setDeleting(true);
    try {
      await deleteBlogPost(deletingPost.id);
      setPosts((prev) => prev.filter((x) => x.id !== deletingPost.id));
      toast.success("Delete the post successfully!");
      await loadData(true); // Tải lại
      setConfirmOpen(false); // Đóng dialog
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete the post. Please try again.");
    } finally {
      setDeleting(false);
      setDeletingPost(null); // Xóa post khỏi state
    }
  }

  //   async function handleDelete(id: number) {
  //     if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
  //     try {
  //       await deleteBlogPost(id);
  //       setPosts((prev) => prev.filter((x) => x.id !== id));
  //       alert("Xóa bài viết thành công!");
  //       await loadData(true);
  //     } catch (e) {
  // console.error(e);
  //       alert("Xóa bài viết thất bại. Vui lòng thử lại.");
  //     }
  //   }

  async function handleSave(input: CreateBlogPostInput) {
    try {
      if (formMode === "create") {
        const created = await createBlogPost(input);
        setPosts((prev) => [created, ...prev]);
        toast.success("Post created successfully!");
      } else if (editingPostId) {
        const updated = await updateBlogPost(editingPostId, input);
        setPosts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        toast.success("Post updated successfully!");
      }
      await loadData(true);
    } catch (e) {
      console.error(e);
      throw e; // Re-throw để BlogFormDialog xử lý
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Manage Blog</h1>
      <p className="text-sm text-neutral-600">Manage and edit blog posts.</p>

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


      {/* === 4. THÊM COMPONENT DIALOG VÀO JSX === */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => !deleting && setConfirmOpen(v)}
        title="Xóa bài viết"
        message={
          <span>
            Are you sure you want to delete this post?
            {deletingPost && (
              <>
                <br />
                <b>{deletingPost.title}</b>
              </>
            )}
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}