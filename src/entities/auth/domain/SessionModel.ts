import mongoose from 'mongoose';
import { LeanDocument } from '../../../database/types';
import { SessionType } from '../types';

type SessionDocumentType = mongoose.HydratedDocument<SessionType>;
type SessionLeanDocument = LeanDocument<SessionType>;

const SessionSchema = new mongoose.Schema<SessionType>({
  deviceName: { type: 'String', required: true },
  deviceId: { type: 'String', required: true },
  ip: { type: 'String', required: true },
  expirationDate: { type: 'Date', required: true },
  issuedDate: { type: 'Date', required: true },
  userId: { type: 'String', required: true },
});

const SessionModel = mongoose.model<SessionType>('Session', SessionSchema);

export { SessionModel };
export type { SessionDocumentType, SessionLeanDocument };
