import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
import type { BlogPost } from "@/types/blog";

interface BlogViewDialogProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (post: BlogPost) => void;
}

export function BlogViewDialog({ post, open, onOpenChange, onEdit }: BlogViewDialogProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Tiêu đề</Label>
            <p className="text-lg font-medium">{post.title}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold">Slug</Label>
            <p className="text-sm text-neutral-600">{post.slug}</p>
          </div>
          {post.excerpt && (
            <div>
              <Label className="text-sm font-semibold">Tóm tắt</Label>
              <p className="text-sm">{post.excerpt}</p>
            </div>
          )}
          {post.content && (
            <div>
              <Label className="text-sm font-semibold">Nội dung</Label>
              <div className="mt-2 p-4 bg-neutral-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{post.content}</pre>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Tác giả</Label>
              <p className="text-sm">{post.authorName ?? `ID: ${post.authorId ?? "N/A"}`}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Trạng thái</Label>
              <p className="text-sm">
                <span
                  className={
                    post.isPublished ? "text-green-600 font-medium" : "text-neutral-500"
                  }
                >
                  {post.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </p>
            </div>
            {post.publishedAt && (
              <div>
                <Label className="text-sm font-semibold">Ngày xuất bản</Label>
                <p className="text-sm">
                  {new Date(post.publishedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
            {post.createdAt && (
              <div>
                <Label className="text-sm font-semibold">Ngày tạo</Label>
                <p className="text-sm">{new Date(post.createdAt).toLocaleString("vi-VN")}</p>
              </div>
            )}
          </div>
{post.tags && post.tags.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {post.imageUrl && (
            <div>
              <Label className="text-sm font-semibold">Hình ảnh</Label>
              <img
                src={post.imageUrl}
                alt={post.title}
                className="mt-2 max-w-full h-auto rounded"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(post);
            }}
          >
            <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
