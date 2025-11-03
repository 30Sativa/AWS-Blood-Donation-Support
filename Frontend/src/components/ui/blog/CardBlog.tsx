import type { BlogPost } from "@/types/blog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card";
import { ArrowRight } from "lucide-react";

interface CardBlogProps {
  post: BlogPost;
  onClick?: () => void;
}

const CardBlog = ({ post, onClick }: CardBlogProps) => {
  return (
    <Card className="w-[320px] h-[420px] bg-white rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="h-[214px] w-full overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="p-0 pt-6 px-7">
        <CardTitle className="text-[20px] font-bold leading-[30px] text-black">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4 px-7 flex-1">
        <p className="text-[14px] font-light leading-[20px] text-black">
          {post.excerpt}
        </p>
      </CardContent>
      <CardFooter className="py-4 px-7">
        <button
          className="text-[18px] font-bold leading-[30px] text-[#C92020] hover:text-primary transition-colors flex items-center"
        >
          Read more 
          <ArrowRight className="w-6 h-6 ml-2" />
        </button>
      </CardFooter>
    </Card>
  );
};

export default CardBlog;
