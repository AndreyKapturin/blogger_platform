import { Express } from 'express';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../../../../src/entities/blogs/constants';
import { InputBlogType } from '../../../../src/entities/blogs/types';
import request from 'supertest';

let app: Express;
let blogsTestManager: BlogsTestManagerType;

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
});

describe(`POST ${Routes.Blogs}`, () => {
  describe(`should create blog, return ${HttpStatus.Created} status code and blog`, () => {
    it('all data is correct', async () => {
      await blogsTestManager.createCorrectBlog();
    });

    it('name has spaces', async () => {
      await blogsTestManager.createCorrectBlog(
        { name: '   IT-INCUBATOR  ' },
        { name: 'IT-INCUBATOR' },
      );
    });

    it('name length equal 1', async () => {
      await blogsTestManager.createCorrectBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await blogsTestManager.createCorrectBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.createCorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.createCorrectBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH),
      });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await blogsTestManager.createCorrectBlog({ websiteUrl: longUrl });
    });

    it.each([
      'https://it-incubator.io',
      'https://it_incubator.io',
      'https://it__incubator.io',
      'https://it-incubator2026.io',
      'https://it-incubator.com',
      'https://it-incubator.io/',
      'https://IT-incubator.io/',
      'https://it-incubator.io/courses',
      'https://it-incubator.io/courses/2',
      'https://it-incubator.io/students/courses/2',
    ])(`websiteUrl is correct: %s`, async (correctURL) => {
      await blogsTestManager.createCorrectBlog({ websiteUrl: correctURL });
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await blogsTestManager.createInorrectBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ]),
      );
    });

    it.each(['name', 'description', 'websiteUrl'])('%s not passed', async (key) => {
      await blogsTestManager.createInorrectBlog({}, [key as keyof InputBlogType]);
    });

    it.each(['name', 'description', 'websiteUrl'])('%s is empty string', async (key) => {
      await blogsTestManager.createInorrectBlog({ [key as keyof InputBlogType]: '' });
    });

    it.each(['name', 'description', 'websiteUrl'])('%s is not string', async (key) => {
      await blogsTestManager.createInorrectBlog({ [key as keyof InputBlogType]: 10 });
    });

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.createInorrectBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.createInorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH) + '.io';
      await blogsTestManager.createInorrectBlog({ websiteUrl: longUrl });
    });

    it.each([
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ])('websiteUrl is incorrect: %s', async (incorrectURL) => {
      await blogsTestManager.createInorrectBlog({ websiteUrl: incorrectURL });
    });

    describe(`should return ${HttpStatus.Unauthorized}`, () => {
      it('if auth header incorrect', async () => {
        await request(app).post(Routes.Blogs).send({}).expect(HttpStatus.Unauthorized);
      });
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});
