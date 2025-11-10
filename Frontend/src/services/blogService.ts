import type { BlogPost, PostTag, CreateBlogPostInput, UpdateBlogPostInput, ApiResponse, PaginatedData } from "@/types/blog";
import apiClient from "./axios";

export async function listBlogPosts(pageNumber = 1, pageSize = 10): Promise<BlogPost[]> {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedData<BlogPost>>>("/api/Posts", {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data.data.items;
  } catch (error) {
    throw error;
  }
}

export async function getBlogPostById(id: number): Promise<BlogPost> {
  try {
    const response = await apiClient.get<ApiResponse<BlogPost>>(`/api/Posts/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

export async function listPostTags(): Promise<PostTag[]> {
  try {
    const response = await apiClient.get<ApiResponse<PostTag[]>>("/api/Posts/tags");
    return response.data.data.map((tag) => ({
      ...tag,
      tagId: tag.id,
    }));
  } catch (error) {
    throw error;
  }
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  try {
    if (!input.title || !input.slug || !input.content) {
      throw new Error("Title, slug, and content are required");
    }

    if (!input.authorId) {
      throw new Error("AuthorId is required");
    }

    if (!input.tagNames || input.tagNames.length === 0) {
      throw new Error("At least one tag is required");
    }

    const requestBody: any = {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content,
      authorId: input.authorId,
      isPublished: input.isPublished,
      tagNames: input.tagNames.filter((name) => name && name.trim() !== ""),
    };

    if (input.excerpt !== null && input.excerpt !== undefined && input.excerpt.trim() !== "") {
      requestBody.excerpt = input.excerpt.trim();
    } else {
      requestBody.excerpt = null;
    }

    const response = await apiClient.post<ApiResponse<BlogPost>>("/api/Posts", requestBody);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function updateBlogPost(id: number, input: UpdateBlogPostInput): Promise<BlogPost> {
  try {
    const requestBody: any = {};
    if (input.title !== undefined) requestBody.title = input.title;
    if (input.slug !== undefined) requestBody.slug = input.slug;
    if (input.content !== undefined) requestBody.content = input.content;
    if (input.excerpt !== undefined && input.excerpt !== null && input.excerpt !== "") {
      requestBody.excerpt = input.excerpt;
    }
    if (input.excerpt !== undefined) {
      requestBody.excerpt = (input.excerpt === null || input.excerpt.trim() === "") 
        ? null 
        : input.excerpt.trim();
    }
    if (input.authorId !== undefined) requestBody.authorId = input.authorId;
    if (input.isPublished !== undefined) requestBody.isPublished = input.isPublished;
    if (input.tagNames !== undefined) requestBody.tagNames = input.tagNames;
const response = await apiClient.put<ApiResponse<BlogPost>>(`/api/Posts/${id}`, requestBody);
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteBlogPost(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/Posts/${id}`);
  } catch (error) {
    throw error;
  }
}
