import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { InputUserType, ViewUserType } from '../../../../src/entities/users/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';
import { InputLoginType } from '../../../../src/entities/auth/types';

let app: Express;
let user: ViewUserType;

const inputUser: InputUserType = {
  login: 'AndrewK',
  email: 'andrew@mail.ru',
  password: 'Qwerty12345!',
};

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  const createUserResponse = await request(app)
    .post(Routes.Users)
    .set('Authorization', authHeader)
    .send(inputUser);
  user = createUserResponse.body;
});

describe(`POST ${Routes.Auth}/login`, () => {
  it.each([
    { loginOrEmail: inputUser.email },
    { loginOrEmail: inputUser.login },
  ])(`should return ${HttpStatus.Ok} if passed valid credentials, accessToken in response body and refreshToken in cookie`, async ({loginOrEmail}) => {
    const inputLoginWithEmail: InputLoginType = {
      loginOrEmail,
      password: inputUser.password
    }

    const loginResponse = await request(app)
      .post(`${Routes.Auth}/login`)
      .send(inputLoginWithEmail);
    
    expect(loginResponse.status).toBe(HttpStatus.Ok);
    expect(loginResponse.body).toEqual({
      accessToken: expect.any(String)
    });
    expect(loginResponse.header['set-cookie'])
      .toEqual(expect.arrayContaining([expect.stringMatching('refreshToken=')]));

  });

  it.each([
    {loginOrEmail: inputUser.login, password: '12345'},
    {loginOrEmail: 'Andrey@', password: inputUser.password},
    {loginOrEmail: 'andrew@@mail.ru', password: inputUser.password},
    {loginOrEmail: 'Andrew_$', password: inputUser.password},
  ])(`should return ${HttpStatus.Bad_Request} if passed credentials syntax invalid`, async (credentials) => {
    await request(app)
      .post(`${Routes.Auth}/login`)
      .send(credentials)
      .expect(HttpStatus.Bad_Request);
  });

  it.each([
    { loginOrEmail: inputUser.login, password: 'Qwerty123!' },
    { loginOrEmail: 'Login_1', password: inputUser.password },
  ])(`should return ${HttpStatus.Unauthorized} if passed invalid credentials`, async (credentials) => {
    await request(app)
      .post(`${Routes.Auth}/login`)
      .send(credentials)
      .expect(HttpStatus.Unauthorized);
  });
  
});

afterAll(async () => {
  await closeBbConnection();
});
