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

export type { BlogType, InputBlogType, BlogIdParamType, ViewBlogType };
