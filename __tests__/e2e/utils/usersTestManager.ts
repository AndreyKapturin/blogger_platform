import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import request from 'supertest';
import { Express } from 'express';
import { authHeader } from '../../../src/core/constants';
import { ISODateStringRegExp } from './constants';
import { InputUserType, ViewUserType } from '../../../src/entities/users/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';

type UserWithToken = {
  user: ViewUserType;
  accessToken: string;
};

const createUsersTestManager = (app: Express) => {
  const createUser = async (
    changedFields: Partial<InputUserType> = {},
    expectedFileds: Partial<InputUserType> = {},
  ) => {
    const login =
      changedFields.login ??
      faker.string.alphanumeric({
        length: { min: MIN_USER_LOGIN_LENGTH, max: MAX_USER_LOGIN_LENGTH },
        casing: 'mixed',
      });
    const email = changedFields.email ?? faker.internet.email();
    const password = changedFields.password ?? faker.internet.password();

    const inputUser: InputUserType = {
      login,
      email,
      password,
    };

    const expectedBody: ViewUserType = {
      id: expect.any(String),
      createdAt: expect.stringMatching(ISODateStringRegExp),
      email: inputUser.email,
      login: inputUser.login,
      ...expectedFileds,
    };

    const response = await request(app)
      .post(Routes.Users)
      .set('Authorization', authHeader)
      .send(inputUser);

    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual(expectedBody);
    return {
      created: response.body as ViewUserType,
      input: inputUser,
    };
  };

  const createManyUsers = async (count: number) => {
    const createUserRequests = [];
    for (let i = 0; i < count; i++) createUserRequests.push(createUser());
    return Promise.all(createUserRequests);
  };

  const loginUser = async (loginOrEmail: string, password: string) => {
    const loginResponse = await request(app).post(`${Routes.Auth}/login`).send({
      loginOrEmail,
      password,
    });
    expect(loginResponse.status).toBe(HttpStatus.Ok);
    return loginResponse.body.accessToken;
  };

  const createManyUsersAndLogin = async (count: number): Promise<UserWithToken[]> => {
    const createUserRequests = [];
    for (let i = 0; i < count; i++) createUserRequests.push(createUser());
    const createdUsers = await Promise.all(createUserRequests);

    const loginUserRequests = createdUsers.map((user) => {
      return loginUser(user.input.login, user.input.password);
    });
    const accessTokens = await Promise.all(loginUserRequests);
    const viewUsersWithTokens = createdUsers.map((user, index) => {
      return {
        user: user.created,
        accessToken: accessTokens[index],
      };
    });
    return viewUsersWithTokens;
  };

  return {
    createUser,
    createManyUsers,
    createManyUsersAndLogin,
    loginUser,
  };
};

export { createUsersTestManager };
export type UsersTestManagerType = ReturnType<typeof createUsersTestManager>;
export type { UserWithToken };
