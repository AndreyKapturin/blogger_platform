import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { InputUserType, ViewUserType } from '../../../../src/entities/users/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';

let app: Express;
let user: ViewUserType;
let accessToken: string;

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
  
  const loginResponse = await request(app)
    .post(`${Routes.Auth}/login`)
    .send({
      loginOrEmail: inputUser.login,
      password: inputUser.password
    });
  
  accessToken = loginResponse.body.accessToken;
});

describe(`GET ${Routes.Auth}/me`, () => {
  it(`should return ${HttpStatus.Ok} and user if passed valid access token`, async () => {
    const meResponse = await request(app)
      .get(`${Routes.Auth}/me`)
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(meResponse.status).toBe(HttpStatus.Ok);
    expect(meResponse.body).toEqual({
      userId: user.id,
      login: user.login,
      email: user.email,
    });
  });

  it(`should return ${HttpStatus.Unauthorized} if passed invalid access token`, async () => {
    const meResponse = await request(app)
      .get(`${Routes.Auth}/me`)
      .set('Authorization', 'Bearer asdadasdasd');    
    expect(meResponse.status).toBe(HttpStatus.Unauthorized);
  });
  
});

afterAll(async () => {
  await closeBbConnection();
});
