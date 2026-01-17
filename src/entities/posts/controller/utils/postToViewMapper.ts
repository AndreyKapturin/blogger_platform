import { WithId } from 'mongodb';
import { PostType, ViewPostType } from '../../types';

const postToViewMapper = (mongoPost: WithId<PostType>, blogName: string): ViewPostType => {
  return {
    id: mongoPost._id.toString(),
    title: mongoPost.title,
    content: mongoPost.content,
    shortDescription: mongoPost.shortDescription,
    createdAt: mongoPost.createdAt,
    blogId: mongoPost.blogId,
    blogName,
  };
};

export { postToViewMapper };
