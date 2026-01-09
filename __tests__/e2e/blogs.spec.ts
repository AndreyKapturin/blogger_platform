import { createApp } from '../../src/app';
import request from 'supertest';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import { BlogType, InputBlogType } from '../../src/entities/blogs/types';
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

// const createInorrectBlog = async (changedFields: {}) => {
//   const inputBlog = {
//     name: 'IT-KAMASUTRA',
//     description: 'Web development lessons',
//     websiteUrl: 'https://it-kamasutra.io',
//     ...changedFields,
//   };
//   const response = await request(app).post(Routes.Blogs).send(inputBlog);
//   expect(response.status).toBe(HttpStatus.Bad_Request);
//   return response;
// };

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
      const deleteResponse = await request(app)
        .delete(`${Routes.Blogs}/${postResponse.body.id}`);
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
