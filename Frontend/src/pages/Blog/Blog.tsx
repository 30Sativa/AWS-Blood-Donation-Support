import { useState } from "react";
import { BlogPosts } from "@/data/BlogPosts";
import CardBlog from "@/components/ui/blog/CardBlog";
import DialogBlog from "@/components/ui/blog/DialogBlog";
import { Search } from "lucide-react";
import heroBg from "@/assets/blog/hero-bg.png";
import type { BlogPost } from "@/types/blog";

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBAEAE]/11">
      {/* Hero Section */}
      <div className="relative w-full h-[398px] overflow-hidden flex flex-start">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <h1 className="text-[64px] font-normal mb-5 leading-[30px] text-black font-kite-one">
            Stories That Save Lives
          </h1>
          <p className="text-[24px] font-light leading-[30px] text-black text-center max-w-[774px] mb-[18px] font-khula">
            Inspiring stories, valuable health tips, and heartfelt experiences
            that connect donors, patients, and medical staff in our shared
            mission to save lives.
          </p>
          
          {/* Search Bar */}
          <div className="relative w-[400px] bg-white/77 border border-black rounded-[10px]">
            <Search className="absolute left-[20px] top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full h-[50px] pl-[57px] pr-4 bg-transparent text-black text-[16px] font-light placeholder:text-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-[114px] py-8">
        <div className="flex flex-wrap justify-between gap-[50px]">
          {BlogPosts.map((post) => (
            <CardBlog key={post.postId} post={post} onClick={() => handleCardClick(post)} />
          ))}
        </div>
      </div>

      {/* Dialog */}
      <DialogBlog 
        post={selectedPost} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Blog;
