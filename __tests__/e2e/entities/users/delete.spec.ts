import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { InputUserType } from '../../../../src/entities/users/types';
import { ISODateStringRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';
import { ObjectId } from 'mongodb';

let app: Express;
const notExistUserId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`DELETE ${Routes.Users}/:id`, () => {
  it(`should delete user if user exist. Return ${HttpStatus.No_Content}`, async () => {
    const inputUser: InputUserType = {
      login: 'AndrewK',
      email: 'andrew@mail.ru',
      password: 'Qwerty12345!',
    };

    const createResponse = await request(app)
      .post(Routes.Users)
      .set('Authorization', authHeader)
      .send(inputUser);

    expect(createResponse.status).toBe(HttpStatus.Created);
    expect(createResponse.body).toEqual({
      id: expect.any(String),
      createdAt: expect.stringMatching(ISODateStringRegExp),
      login: inputUser.login,
      email: inputUser.email,
    });

    const deleteResponse = await request(app)
      .delete(`${Routes.Users}/${createResponse.body.id}`)
      .set('Authorization', authHeader);
    expect(deleteResponse.status).toBe(HttpStatus.No_Content);
  });

  it(`should return ${HttpStatus.Unauthorized} if auth header not passed`, async () => {
    const deleteResponse = await request(app)
      .delete(`${Routes.Users}/${notExistUserId}`);
    expect(deleteResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Not_Found} if user not exist`, async () => {
    const deleteResponse = await request(app)
      .delete(`${Routes.Users}/${notExistUserId}`)
      .set('Authorization', authHeader);
    expect(deleteResponse.status).toBe(HttpStatus.Not_Found);
  });
});

afterAll(async () => {
  await closeBbConnection();
});
