import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BlogPost } from "@/types/blog";
import { BlogActions } from "./BlogActions";

interface BlogTableProps {
  posts: BlogPost[];
  loading: boolean;
  onView: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: number) => void;
}

export function BlogTable({ posts, loading, onView, onEdit, onDelete }: BlogTableProps) {
  if (loading) {
    return (
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34%]">Tiêu đề</TableHead>
              <TableHead>Ngày xuất bản</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-neutral-500">
                Đang tải...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34%]">Tiêu đề</TableHead>
              <TableHead>Ngày xuất bản</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-neutral-500">
                Không có bài viết nào.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[34%]">Tiêu đề</TableHead>
            <TableHead>Ngày xuất bản</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="hover:bg-neutral-50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div>
<div className="font-medium">{post.title}</div>
                    <div className="text-xs text-neutral-500">{post.slug}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleString("vi-VN")
                  : "-"}
              </TableCell>
              <TableCell>
                <span
                  className={
                    post.isPublished ? "text-green-600 font-medium" : "text-neutral-500"
                  }
                >
                  {post.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-neutral-700">
                {post.tags && post.tags.length > 0 ? post.tags.join(", ") : "-"}
              </TableCell>
              <TableCell>
                <BlogActions post={post} onView={onView} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
