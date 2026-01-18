import { WithId } from 'mongodb';
import { BlogType, ViewBlogType } from '../../types';

export const blogToViewMapper = (mongoBlog: WithId<BlogType>): ViewBlogType => {
  return {
    id: mongoBlog._id.toString(),
    name: mongoBlog.name,
    createdAt: mongoBlog.createdAt,
    isMembership: mongoBlog.isMembership,
    description: mongoBlog.description,
    websiteUrl: mongoBlog.websiteUrl,
  };
};
