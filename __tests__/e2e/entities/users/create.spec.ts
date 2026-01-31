import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { InputUserType } from '../../../../src/entities/users/types';
import { ISODateStringRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';

let app: Express;

const inputUser: InputUserType = {
  login: 'AndrewK',
  email: 'andrew@mail.ru',
  password: 'Qwerty12345!',
};

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`POST ${Routes.Users}`, () => {
  it('should create user if all data is correct', async () => {
    const response = await request(app)
      .post(Routes.Users)
      .set('Authorization', authHeader)
      .send(inputUser);

    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual({
      id: expect.any(String),
      createdAt: expect.stringMatching(ISODateStringRegExp),
      login: inputUser.login,
      email: inputUser.email,
    });
  });

  it(`should return ${HttpStatus.Bad_Request} if input data has incorrect fields`, async () => {
    const incorrectInputUser = {
      login: 'A',
      email: 'andrew@@@mail.ru',
    };
    const response = await request(app)
      .post(Routes.Users)
      .set('Authorization', authHeader)
      .send(incorrectInputUser);
    expect(response.status).toBe(HttpStatus.Bad_Request);
    expect(response.body).toEqual({
      errorsMessages: expect.arrayContaining([
        {
          field: 'password',
          message: expect.any(String),
        },
        {
          field: 'login',
          message: expect.any(String),
        },
        {
          field: 'email',
          message: expect.any(String),
        },
      ]),
    });
  });

  it(`should return ${HttpStatus.Unauthorized} if auth header not passed`, async () => {
    const response = await request(app).post(Routes.Users).send(inputUser);
    expect(response.status).toBe(HttpStatus.Unauthorized);
  });
});

afterAll(async () => {
  await closeBbConnection();
});
