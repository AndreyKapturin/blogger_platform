import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

type PostIdParamType = {
  id: string;
};

type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
};

type ViewPostType = PostType & PostIdParamType;

type InputPostType = Omit<PostType, 'createdAt' | 'blogName'>;
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
  InputPostType,
  ViewPostQuery,
  InputBlogPostType,
};
