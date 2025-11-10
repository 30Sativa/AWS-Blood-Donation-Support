import { Button } from "@/components/ui/button";
import { Eye, Edit3, Trash2 } from "lucide-react";
import type { BlogPost } from "@/types/blog";

interface BlogActionsProps {
  post: BlogPost;
  onView: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: number) => void;
}

export function BlogActions({ post, onView, onEdit, onDelete }: BlogActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView(post)}
        className="h-8 w-8"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(post)}
        className="h-8 w-8"
        title="Edit"
      >
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(post.id)}
        className="h-8 w-8 text-destructive hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}