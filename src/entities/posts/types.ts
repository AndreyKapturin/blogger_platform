import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

type PostIdParamType = {
  id: string;
};

type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
  blogName: string;
};

type ViewPostType = {
  id: string,
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
}

type InputUpdatePostType = Omit<PostType, 'createdAt'>;
type InputPostType = Omit<InputUpdatePostType, 'blogName'>;
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
};
