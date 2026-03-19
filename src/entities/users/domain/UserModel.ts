import mongoose from 'mongoose';
import { EmailConfirmationType, UserType } from '../types';
import {
  MAX_USER_LOGIN_LENGTH_DB,
  MAX_USER_EMAIL_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type UserDocumentType = mongoose.HydratedDocument<UserType>;
type UserLeanDocument = LeanDocument<UserType>;

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>(
  {
    isConfirmed: { type: 'Boolean', default: false },
    code: { type: 'String' },
    codeExpirationDate: { type: 'Date' },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema<UserType>({
  login: { type: 'String', required: true, maxLength: MAX_USER_LOGIN_LENGTH_DB },
  email: { type: 'String', required: true, unique: true, maxLength: MAX_USER_EMAIL_LENGTH_DB },
  passwordHash: { type: 'String', required: true },
  emailConfirmation: emailConfirmationSchema,
  createdAt: { type: 'Date', required: true, default: new Date() },
});

const UserModel = mongoose.model<UserType>('User', userSchema);

export { UserModel };
export type { UserDocumentType, UserLeanDocument };
