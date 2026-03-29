import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';
import { LikeStatus } from '../comments/types';

type PostIdParamType = {
  id: string;
};

type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

type PostLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLike[];
};

type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
  blogName: string;
  likesInfo: PostLikesInfoType;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLike[];
};

type ViewPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfo;
};

type InputUpdatePostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

type InputPostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

type InputBlogPostType = Omit<InputPostType, 'blogId'>;

enum PostSortField {
  Title = 'title',
  BlogName = 'blogName',
  CreatedAt = 'createdAt',
}

type ViewPostQuery = PaginationAndSortQuery<PostSortField>;

export { PostSortField };
export type {
  PostIdParamType,
  ViewPostType,
  PostType,
  InputUpdatePostType,
  InputPostType,
  ViewPostQuery,
  InputBlogPostType,
  NewestLike,
  PostLikesInfoType,
  ExtendedLikesInfo,
};
