type BlogIdParamType = {
  id: string
}

type BlogType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

type InputBlogType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type { BlogType, InputBlogType, BlogIdParamType };
