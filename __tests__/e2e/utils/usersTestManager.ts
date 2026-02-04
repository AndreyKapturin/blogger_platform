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

const createUsersTestManager = (app: Express) => {
  const createUser = async (
    changedFields: Partial<InputUserType> = {},
    expectedFileds: Partial<InputUserType> = {},
  ): Promise<ViewUserType> => {
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
      ...expectedFileds
    };

    const response = await request(app)
      .post(Routes.Users)
      .set('Authorization', authHeader)
      .send(inputUser);

    expect(response.status).toBe(HttpStatus.Created)
    expect(response.body).toEqual(expectedBody);
    return response.body;
  };

  const createManyUsers = async (count: number) => {
    const createUserRequests: Promise<ViewUserType>[] = [];
    for (let i = 0; i < count; i++) createUserRequests.push(createUser());
    return Promise.all(createUserRequests)
  }

  return {
    createUser,
    createManyUsers,
  }
};

export { createUsersTestManager };
export type UsersTestManagerType = ReturnType<typeof createUsersTestManager>;
