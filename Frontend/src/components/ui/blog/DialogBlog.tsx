import type { BlogPost } from "@/types/blog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../dialog";
import { X } from "lucide-react";
import image25 from "@/assets/blog/image25.png";
import image26 from "@/assets/blog/image26.png";

interface DialogBlogProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogBlog = ({ post, open, onOpenChange }: DialogBlogProps) => {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&]:max-w-[900px] [&]:w-[900px] [&]:max-h-[90vh] bg-[#FFFCFC] [&]:border-black/23 [&]:p-0 overflow-hidden [&]:transform-none [&]:left-[50%] [&]:top-[50%] [&]:translate-x-[-50%] [&]:translate-y-[-50%]">
        <DialogHeader className="px-[60px] pt-[27px] pb-0">
          <DialogTitle className="text-[36px] font-bold leading-[44px] text-center text-black font-inter">
            {post.title}
          </DialogTitle>
        </DialogHeader>

        <DialogClose className="absolute right-[9px] top-[9px] w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X className="w-[21px] h-[21px] text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="px-[40px] pb-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Intro Text */}
          <p className="text-[18px] font-light leading-[26px] text-black mb-[50px] font-inter">
            Every few seconds, someone somewhere needs blood — for surgery, accident recovery, childbirth, or chronic illness. Yet, despite modern medicine's progress, blood cannot be manufactured. It can only come from generous people who choose to give.
          </p>

          {/* Images */}
          <div className="flex gap-[60px] mb-[50px] justify-around">
            <div className="w-[280px] h-[190px] overflow-hidden rounded-lg">
              <img
                src={image25}
                alt="Nurse caring for patient"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-[280px] h-[190px] overflow-hidden rounded-lg">
              <img
                src={image26}
                alt="Blood donation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          {post.introduction ? (
            <div className="space-y-6">
              {post.introduction.map((section, index) => (
                <div key={index}>
                  <h3 className="text-[22px] font-bold leading-[26px] text-black mb-3 font-inter">
                    {section.title}
                  </h3>
                  <p className="text-[18px] font-light leading-[26px] text-black font-inter">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBlog;
