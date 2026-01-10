import { createApp } from '../../src/app';
import request from 'supertest';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import { BlogType, InputBlogType } from '../../src/entities/blogs/types';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../../src/entities/blogs/constants';
const app = createApp();

const correctInputBlog: InputBlogType = {
  name: 'IT-KAMASUTRA',
  description: 'Web development lessons',
  websiteUrl: 'https://it-kamasutra.io',
};

const notExistBlogId = 'p'.repeat(5);

const createCorrectBlog = async (changedFields: Partial<InputBlogType> = {}) => {
  const inputBlog: InputBlogType = {
    ...correctInputBlog,
    ...changedFields,
  };
  const expectedBlog: BlogType = {
    id: expect.any(String),
    ...correctInputBlog,
    ...changedFields,
  };
  const response = await request(app).post(Routes.Blogs).send(inputBlog);
  expect(response.status).toBe(HttpStatus.Created);
  expect(response.body).toEqual(expectedBlog);
  return response;
};

const createInorrectBlog = async (
  changedFields: Partial<InputBlogType> = {},
  excludedFileds: (keyof InputBlogType)[] = []
) => {
  const inputBlog = { ...correctInputBlog };

  Object.assign(inputBlog, changedFields);

  for (const key of excludedFileds) {
    delete inputBlog[key];
  }

  const response = await request(app).post(Routes.Blogs).send(inputBlog);
  expect(response.status).toBe(HttpStatus.Bad_Request);
  expect(response.body).toEqual({
    errorsMessages: expect.arrayContaining([
      expect.objectContaining({
        field: expect.any(String),
        message: expect.any(String),
      }),
    ]),
  });
  return response;
};

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`GET ${Routes.Blogs}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('and empty array if blogs not exist', async () => {
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([]);
    });

    it('and blogs array if blogs exist', async () => {
      const blog1Response = await createCorrectBlog({ name: 'Blog 1' });
      const blog2Response = await createCorrectBlog({ name: 'Blog 2' });
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([blog1Response.body, blog2Response.body]);
    });
  });
});

describe(`GET ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and blog if blog is found`, () => {
    it('blog is exist', async () => {
      const postResponse = await createCorrectBlog();
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body).toEqual(postResponse.body);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const getResponse = await request(app).get(`${Routes.Blogs}/${notExistBlogId}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
});

describe(`POST ${Routes.Blogs}`, () => {
  describe(`should create blog, return ${HttpStatus.Created} status code and blog`, () => {
    it('all data is correct', async () => {
      await createCorrectBlog();
    });

    it('name length equal 1', async () => {
      await createCorrectBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await createCorrectBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await createCorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await createCorrectBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH) });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await createCorrectBlog({ websiteUrl: longUrl });
    });

    const correctURLs = [
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
    ];

    for (const correctURL of correctURLs) {
      it(`websiteUrl is correct: ${correctURL}`, async () => {
        await createCorrectBlog({ websiteUrl: correctURL });
      });
    }

  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await createInorrectBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ])
      );
    });

    for (const key in correctInputBlog) {
      it(`"${key}" not passed`, async () => {
        await createInorrectBlog({}, [key as keyof InputBlogType]);
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is empty string`, async () => {
        await createInorrectBlog({ [key as keyof InputBlogType]: '' });
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is not string`, async () => {
        await createInorrectBlog({ [key as keyof InputBlogType]: 10 });
      });
    }

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await createInorrectBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1) });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await createInorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await createInorrectBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      await createInorrectBlog({ websiteUrl: 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH + 1) });
    });

    const incorrectURLs = [
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ];

    for (const incorrectURL of incorrectURLs) {
      it(`websiteUrl is incorrect: ${incorrectURL}`, async () => {
        await createInorrectBlog({ websiteUrl: incorrectURL });
      });
    }
  });
});

describe(`PUT ${Routes.Blogs}/:id`, () => {
  describe(`should update blog, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      const postResponse = await createCorrectBlog();
      const updateBlogData: InputBlogType = {
        ...correctInputBlog,
        name: 'Updated name',
      };
      const updateResponse = await request(app)
        .put(`${Routes.Blogs}/${postResponse.body.id}`)
        .send(updateBlogData);
      expect(updateResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body.name).toBe(updateBlogData.name);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const response = await request(app)
        .put(`${Routes.Blogs}/${notExistBlogId}`)
        .send(correctInputBlog);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });
});

describe(`DELETE ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.No_Content} status code if blog was successfuly deleted`, () => {
    it('blog exist', async () => {
      const postResponse = await createCorrectBlog();
      const deleteResponse = await request(app).delete(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const response = await request(app).delete(`${Routes.Blogs}/${notExistBlogId}`);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });
});
