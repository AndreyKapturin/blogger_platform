import { createApp } from '../../src/app';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import request from 'supertest';
import { InputPostType } from '../../src/entities/posts/types';
import { BlogType } from '../../src/entities/blogs/types';
import { createBlogsTestManager } from './utils/blogsTestManager';
import { createPostsTestManager, correctInputPostData } from './utils/PostsTestManager';
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
  MAX_POST_TITLE_LENGTH,
} from '../../src/entities/posts/constants';

const app = createApp();
const { createCorrectBlog } = createBlogsTestManager(app);
const { createCorrectPost, createInorrectPost, correctUpdatePost, incorrectUpdatePost } =
  createPostsTestManager(app);
let blog: BlogType;

const notExistPostId = 'notExistPostId';
const notExistBlogId = 'notExistBlogId';

beforeEach(async () => {
  blog = (await createCorrectBlog()).body as BlogType;
  correctInputPostData.blogId = blog.id;
});

describe(`GET ${Routes.Posts}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('and empty array if posts not exist', async () => {
      const response = await request(app).get(Routes.Posts);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([]);
    });

    it('and posts array if posts exist', async () => {
      const post1Response = await createCorrectPost(blog, { title: 'Post 1' });
      const post2Response = await createCorrectPost(blog, { title: 'Post 2' });
      const response = await request(app).get(Routes.Posts);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([post1Response.body, post2Response.body]);
    });
  });
});

describe(`GET ${Routes.Posts}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and post if post is found`, () => {
    it('post is exist', async () => {
      const postResponse = await createCorrectPost(blog);
      const getResponse = await request(app).get(`${Routes.Posts}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body).toEqual(postResponse.body);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const getResponse = await request(app).get(`${Routes.Posts}/${notExistPostId}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
});

describe(`POST ${Routes.Posts}`, () => {
  describe(`should create post, return ${HttpStatus.Created} status code and post`, () => {
    it('all data is correct', async () => {
      await createCorrectPost(blog);
    });

    it('title has spaces', async () => {
      await createCorrectPost(
        blog,
        { title: '   Express tutorial  ' },
        { title: 'Express tutorial' }
      );
    });

    it('title length equal 1', async () => {
      await createCorrectPost(blog, { title: 'p' });
    });

    it('content length equal 1', async () => {
      await createCorrectPost(blog, { content: 'p' });
    });

    it('shortDescription length equal 1', async () => {
      await createCorrectPost(blog, { shortDescription: 'p' });
    });

    it(`title length equal max: ${MAX_POST_TITLE_LENGTH}`, async () => {
      await createCorrectPost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH) });
    });

    it(`content length equal max: ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await createCorrectPost(blog, { content: 'p'.repeat(MAX_POST_CONTENT_LENGTH) });
    });

    it(`shortDescription length equal max: ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await createCorrectPost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH),
      });
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await createInorrectPost({ content: '' }, ['title']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
        ])
      );
    });

    for (const key in correctInputPostData) {
      it(`${key} not passed`, async () => {
        await createInorrectPost({}, [key as keyof InputPostType]);
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is empty string`, async () => {
        await createInorrectPost({ [key as keyof InputPostType]: '' });
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is not string`, async () => {
        await createInorrectPost({ [key as keyof InputPostType]: 10 });
      });
    }

    it(`title length more than ${MAX_POST_TITLE_LENGTH}`, async () => {
      await createInorrectPost({ title: 'p'.repeat(MAX_POST_TITLE_LENGTH + 1) });
    });

    it(`content length more than ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await createInorrectPost({ content: 'p'.repeat(MAX_POST_CONTENT_LENGTH + 1) });
    });

    it(`shortDescription length more than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await createInorrectPost({
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`blog with passed blogId not existed`, async () => {
      await createInorrectPost({ blogId: notExistBlogId });
    });
  });
});

describe(`PUT ${Routes.Posts}/:id`, () => {
  describe(`should update post, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      const dataForUpdate: Partial<InputPostType> = {
        title: 'How create express app?',
        content: 'a'.repeat(110),
        shortDescription: 'd'.repeat(45),
      };
      await correctUpdatePost(blog, dataForUpdate);
    });

    it('title has spaces', async () => {
      await correctUpdatePost(
        blog,
        { title: '   Express tutorial  ' },
        { title: 'Express tutorial' }
      );
    });

    it('title length equal 1', async () => {
      await correctUpdatePost(blog, { title: 'p' });
    });

    it('content length equal 1', async () => {
      await correctUpdatePost(blog, { content: 'p' });
    });

    it('shortDescription length equal 1', async () => {
      await correctUpdatePost(blog, { shortDescription: 'p' });
    });

    it(`title length equal max: ${MAX_POST_TITLE_LENGTH}`, async () => {
      await correctUpdatePost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH) });
    });

    it(`content length equal max: ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await correctUpdatePost(blog, { content: 'p'.repeat(MAX_POST_CONTENT_LENGTH) });
    });

    it(`shortDescription length equal max: ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await correctUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH),
      });
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app)
        .put(`${Routes.Posts}/${notExistPostId}`)
        .send(correctInputPostData);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await incorrectUpdatePost(blog, { content: '' }, ['title']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
        ])
      );
    });

    for (const key in correctInputPostData) {
      it(`${key} not passed`, async () => {
        await incorrectUpdatePost(blog, {}, [key as keyof InputPostType]);
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is empty string`, async () => {
        await incorrectUpdatePost(blog, { [key as keyof InputPostType]: '' });
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is not string`, async () => {
        await incorrectUpdatePost(blog, { [key as keyof InputPostType]: 10 });
      });
    }

    it(`title length more than ${MAX_POST_TITLE_LENGTH}`, async () => {
      await incorrectUpdatePost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH + 1) });
    });

    it(`content length more than ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await incorrectUpdatePost(blog, { content: 'p'.repeat(MAX_POST_CONTENT_LENGTH + 1) });
    });

    it(`shortDescription length more than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await incorrectUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`blog with passed blogId not existed`, async () => {
      await incorrectUpdatePost(blog, { blogId: notExistBlogId });
    });
  });
});

describe(`DELETE ${Routes.Posts}/:id`, () => {
  describe(`should return ${HttpStatus.No_Content} status code if post was successfuly deleted`, () => {
    it('post exist', async () => {
      const postResponse = await createCorrectPost(blog);
      const deleteResponse = await request(app).delete(`${Routes.Posts}/${postResponse.body.id}`);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Posts}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app).delete(`${Routes.Posts}/${notExistPostId}`);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });
});
