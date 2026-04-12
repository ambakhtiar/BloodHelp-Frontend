import axiosInstance from "../lib/axiosInstance";
import type { ICreatePostPayload, IPostResponse } from "../types/post.types";

export interface IPostFilters {
  searchTerm?: string;
  type?: string;
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
  isResolved?: boolean;
  hasLiked?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ICommentPayload {
  postId: string;
  content: string;
  parentId?: string | null;
}

export const getAllPosts = async (paramsObj?: IPostFilters): Promise<any> => {
  const params = new URLSearchParams();

  if (paramsObj) {
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const response = await axiosInstance.get(`/posts?${params.toString()}`);
  return response.data;
};

export const getSinglePost = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (payload: ICreatePostPayload): Promise<IPostResponse> => {
  const response = await axiosInstance.post("/posts", payload);
  return response.data;
};

export const toggleLike = async (postId: string): Promise<any> => {
  const response = await axiosInstance.post('/posts/engagement/like', { postId });
  return response.data;
};

export const addComment = async (payload: ICommentPayload): Promise<any> => {
  const response = await axiosInstance.post('/posts/engagement/comment', payload);
  return response.data;
};

export const getPostComments = async (postId: string): Promise<any> => {
  const response = await axiosInstance.get(`/posts/engagement/${postId}/comments`);
  return response.data;
};

export const getUserPosts = async (userId: string): Promise<any> => {
  const response = await axiosInstance.get(`/posts/user/${userId}`);
  return response.data;
};

export const updatePost = async (id: string, payload: Partial<ICreatePostPayload>): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/${id}`, payload);
  return response.data;
};

export const deletePost = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/posts/${id}`);
  return response.data;
};

export const resolvePost = async (id: string): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/${id}/resolve`);
  return response.data;
};
