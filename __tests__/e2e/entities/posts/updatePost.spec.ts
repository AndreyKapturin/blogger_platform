import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { correctInputPostData, createPostsTestManager, PostsTestManagerType } from '../../utils/PostsTestManager';
import { InputPostType } from '../../../../src/entities/posts/types';
import { MAX_POST_CONTENT_LENGTH, MAX_POST_SHORT_DESCRIPTION_LENGTH, MAX_POST_TITLE_LENGTH } from '../../../../src/entities/posts/constants';
import { authHeader } from '../../../../src/core/constants';
import { ObjectId } from 'mongodb';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let blog: ViewBlogType;
const notExistBlogId = new ObjectId().toString();
const notExistPostId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  blog = (await blogsTestManager.createCorrectBlog()).body;
});


describe(`PUT ${Routes.Posts}/:id`, () => {
  describe(`should update post, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      const dataForUpdate: Partial<InputPostType> = {
        title: 'How create express app?',
        content: 'a'.repeat(110),
        shortDescription: 'd'.repeat(45),
      };
      await postsTestManager.correctUpdatePost(blog, dataForUpdate);
    });

    it('send double request', async () => {
      const postResponse = await postsTestManager.createCorrectPost(blog);

      const updateResponse1 = await request(app)
        .put(`${Routes.Posts}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, title: 'Updated title' });
      expect(updateResponse1.status).toBe(HttpStatus.No_Content);

      const updateResponse2 = await request(app)
        .put(`${Routes.Posts}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, title: 'Updated title' });
      expect(updateResponse2.status).toBe(HttpStatus.No_Content);
    });

    it('title has spaces', async () => {
      await postsTestManager.correctUpdatePost(
        blog,
        { title: '   Express tutorial  ' },
        { title: 'Express tutorial' },
      );
    });

    it('title length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { title: 'p' });
    });

    it('content length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { content: 'p' });
    });

    it('shortDescription length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { shortDescription: 'p' });
    });

    it(`title length equal max: ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH) });
    });

    it(`content length equal max: ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, {
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH),
      });
    });

    it(`shortDescription length equal max: ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH),
      });
    });

    it('blog replaced on existed blog', async () => {
      const newBlog = await blogsTestManager.createCorrectBlog({ name: 'New blog' });
      await postsTestManager.correctUpdatePost(
        blog,
        {
          blogId: newBlog.body.id,
        },
        {
          blogId: newBlog.body.id,
          blogName: newBlog.body.name,
        },
      );
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app)
        .put(`${Routes.Posts}/${notExistPostId}`)
        .set('Authorization', authHeader)
        .send({
          ...correctInputPostData,
          blogId: blog.id,
        });
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await postsTestManager.incorrectUpdatePost(blog, { content: '' }, ['title']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
        ]),
      );
    });

    for (const key in correctInputPostData) {
      it(`${key} not passed`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, {}, [key as keyof InputPostType]);
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is empty string`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, { [key as keyof InputPostType]: '' });
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is not string`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, { [key as keyof InputPostType]: 10 });
      });
    }

    it(`title length more than ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        title: 'p'.repeat(MAX_POST_TITLE_LENGTH + 1),
      });
    });

    it(`content length more than ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH + 1),
      });
    });

    it(`shortDescription length more than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH + 1),
      });
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code`, () => {
    it(`blog with passed blogId not existed`, async () => {
      const createPostResponse = await postsTestManager.createCorrectPost(blog);
      const updateResponse = await request(app)
        .put(`${Routes.Posts}/${createPostResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({
          title: createPostResponse.body.title,
          content: createPostResponse.body.content,
          shortDescription: createPostResponse.body.shortDescription,
          blogId: notExistBlogId,
        });
      expect(updateResponse.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await postsTestManager.createCorrectPost(blog);
      const { id, blogName, ...updatedPost } = { ...createRespone.body, title: 'New post title' };
      await request(app)
        .put(`${Routes.Posts}/${id}`)
        .send(updatedPost)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});