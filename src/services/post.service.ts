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
  isApproved?: boolean;
  isVerified?: boolean;
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

export const editComment = async (commentId: string, payload: { content: string }): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/engagement/comment/${commentId}`, payload);
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<any> => {
  const response = await axiosInstance.delete(`/posts/engagement/comment/${commentId}`);
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

export const approvePost = async (id: string): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/${id}/approve`);
  return response.data;
};

export const verifyPost = async (id: string): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/${id}/verify`);
  return response.data;
};

export const toggleDeletePost = async (id: string): Promise<any> => {
  const response = await axiosInstance.patch(`/posts/${id}/toggle-delete`);
  return response.data;
};

export interface IDonorLookupResult {
  found: boolean;
  type?: 'platform_user' | 'blood_donor';
  name?: string;
  bloodGroup?: string;
  gender?: string;
  lastDonationDate?: string;
}

/** Check if a donor exists by contact number — used in CreatePostForm */
export const checkDonorByPhone = async (contactNumber: string): Promise<{ data: IDonorLookupResult }> => {
  const response = await axiosInstance.get(`/posts/check-donor/${contactNumber}`);
  return response.data;
};

/** Accept or Reject a B-3 donation consent notification */
export const respondToConsent = async (postId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<any> => {
  const response = await axiosInstance.post(`/posts/${postId}/consent`, { status });
  return response.data;
};

/** Accept or Reject a hospital donation record request (DONATION_RECORD_REQUEST) */
export const respondToHospitalRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<any> => {
  const response = await axiosInstance.patch(`/hospitals/requests/${requestId}`, { status });
  return response.data;
};

