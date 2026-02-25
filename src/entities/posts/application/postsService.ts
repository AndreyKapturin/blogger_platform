import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { postsCommandRepository } from '../repositories/postsCommandRepository';
import { InputPostType, InputUpdatePostType, PostType } from '../types';

const createPost = async (inputPost: InputPostType): Promise<Result<string>> => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);

  if (!blog) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
      {
        field: 'blogId',
        message: `Blog with id ${inputPost.blogId} not found`,
      },
    ]);
  }

  const newPost: PostType = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    createdAt: new Date().toISOString(),
    blogId: blog.id,
    blogName: blog.name,
  };

  const createdPostId = await postsCommandRepository.save(newPost);

  return ResultFactory.success(createdPostId);
};

const updatePost = async (
  postId: string,
  inputPost: InputPostType,
): Promise<Result<string | null>> => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);

  if (!blog) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
      {
        field: 'blogId',
        message: `Blog with id ${inputPost.blogId} not found`,
      },
    ]);
  }

  const updatedPost: InputUpdatePostType = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    blogId: blog.id,
    blogName: blog.name,
  };

  const wasUpdated = await postsCommandRepository.update(postId, updatedPost);

  if (!wasUpdated) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
      {
        field: 'id',
        message: `Post with id ${postId} not found`,
      },
    ]);
  }

  return ResultFactory.success(null);
};

const deletePost = async (postId: string): Promise<Result> => {
  const wasDeleted = await postsCommandRepository.remove(postId);

  if (!wasDeleted) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
      {
        field: 'id',
        message: `Post with id ${postId} not exist`,
      },
    ]);
  }
  
  return ResultFactory.success(null);
};

const postsService = {
  createPost,
  updatePost,
  deletePost,
};

export { postsService };
