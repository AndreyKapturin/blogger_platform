import { Result, ResultStatus } from '../../../core/types/Result';
import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { postsCommandRepository } from '../repositories/postsCommandRepository';
import { InputPostType, InputUpdatePostType, PostType } from '../types';

const createPost = async (inputPost: InputPostType): Promise<Result<string>> => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);

  if (!blog) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: 'Blog not found',
      extensions: [
        {
          field: 'blogId',
          message: `Blog with id ${inputPost.blogId} not found`
        }
      ]
    }
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

  return {
    status: ResultStatus.Success,
    data: createdPostId,
    extensions: []
  }
};

const updatePost = async (postId: string, inputPost: InputPostType): Promise<Result<string | null>> => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);

  if (!blog) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: 'Blog not found',
      extensions: [
        {
          field: 'blogId',
          message: `Blog with id ${inputPost.blogId} not found`
        }
      ]
    }
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
    return {
      status: ResultStatus.NotFound,
      errorMessage: 'Post not found',
      extensions: [
        {
          field: 'id',
          message: `Post with id ${postId} not found`
        }
      ]
    }
  }

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  }
};

const deletePost = async (postId: string): Promise<Result> => {
  const wasDeleted = await postsCommandRepository.remove(postId);

  if (wasDeleted) {
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: []
    }
  } else {
    return {
      status: ResultStatus.NotFound,
      extensions: [
        {
          field: 'id',
          message: `Post with id ${postId} not exist`
        }
      ]
    }
  }

};

const postsService = {
  createPost,
  updatePost,
  deletePost,
};

export { postsService };
