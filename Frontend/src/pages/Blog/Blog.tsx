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
      <div className="relative w-full h-[398px] md:h-[398px] sm:h-[300px] overflow-hidden flex items-start">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-[64px] md:text-[48px] sm:text-[32px] font-normal mb-5 leading-[70px] md:leading-[60px] sm:leading-10pt text-black font-kite-one">
            Stories That Save Lives
          </h1>
          <p className="text-[24px] md:text-[20px] sm:text-[16px] font-light leading-[30px] md:leading-10 sm:leading-[22px] text-black max-w-[774px] md:max-w-[600px] sm:max-w-[90%] mb-[18px] font-khula">
            Inspiring stories, valuable health tips, and heartfelt experiences
            that connect donors, patients, and medical staff in our shared
            mission to save lives.
          </p>

          {/* Search Bar */}
          <div className="relative w-[400px] md:w-[300px] sm:w-[90%] bg-white/77 border border-black rounded-[10px] mt-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full h-[50px] pl-[57px] pr-4 bg-transparent text-black text-[16px] font-light placeholder:text-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 md:px-[114px] py-8">
        <div className="flex flex-wrap justify-center sm:justify-between gap-6 sm:gap-[50px]">
          {BlogPosts.map((post) => (
            <div className="w-full sm:w-[48%] md:w-[30%]" key={post.postId}>
              <CardBlog post={post} onClick={() => handleCardClick(post)} />
            </div>
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
