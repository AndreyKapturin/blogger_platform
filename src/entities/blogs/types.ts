import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

type BlogIdParamType = {
  id: string;
};

type BlogType = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

type ViewBlogType = BlogType & BlogIdParamType;

type InputBlogType = Omit<BlogType, 'createdAt' | 'isMembership'>;

enum BlogSortField {
  Name = 'name',
  CreatedAt = 'createdAt',
}

type ViewBlogQuery = PaginationAndSortQuery<BlogSortField> & {
  searchNameTerm: string | null;
};

export { BlogSortField };
export type { BlogType, InputBlogType, BlogIdParamType, ViewBlogType, ViewBlogQuery };
