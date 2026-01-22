import { PaginationQuery } from '../../core/types/Pagination';
import { SortDirection } from "../../core/types/Sorting";

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
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  CreatedAt = 'createdAt',
  IsMembership = 'isMembership',
}

type ViewBlogQuery = PaginationQuery & {
  sortDirection: SortDirection;
  searchNameTerm: string | null;
  sortBy: BlogSortField;
};

export { BlogSortField };
export type { BlogType, InputBlogType, BlogIdParamType, ViewBlogType, ViewBlogQuery };
