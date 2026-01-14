import { database } from '../../database';
import { PostType } from './types';

const fildAll = () => database.posts;
const findById = (postId: string) => {
  return database.posts.find((post) => post.id === postId) ?? null;
};
const save = (inputPost: PostType) => {
  database.posts.push(inputPost);
  return inputPost;
};
const update = (inputPost: PostType) => {
  for (const post of database.posts) {
    if (post.id === inputPost.id) {
      post.title = inputPost.title;
      post.shortDescription = inputPost.shortDescription;
      post.content = inputPost.content;
      post.blogId = inputPost.blogId;
      return true;
    }
  }
  return false;
};
const remove = (postId: string) => {
  let wasDeleted = false;
  database.posts = database.posts.filter((post) => {
    if (post.id === postId) {
      wasDeleted = true;
      return false;
    }
    return true;
  });
  return wasDeleted;
};
const removeRelated = (blogId: string) => {
  let removeCount = 0;
  database.posts = database.posts.filter((post) => {
    if (post.blogId === blogId) {
      removeCount++;
      return false;
    }
    return true;
  });
  return removeCount;
};
const postsRepository = {
  fildAll,
  findById,
  save,
  update,
  remove,
  removeRelated,
};

export { postsRepository };
