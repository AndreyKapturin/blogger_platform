import mongoose from 'mongoose';
import { LeanDocument } from '../../../database/types';
import { RecoveryCodeType } from '../types';

type RecoveryCodeDocumentType = mongoose.HydratedDocument<RecoveryCodeType>;
type RecoveryCodeLeanDocument = LeanDocument<RecoveryCodeType>;

const recoveryCodeSchema = new mongoose.Schema<RecoveryCodeType>({
  userId: { type: 'String', required: true },
  expirationDate: { type: 'Date', required: true },
  code: { type: 'String', required: true },
});

const RecoveryCodeModel = mongoose.model<RecoveryCodeType>('Recovery_codes', recoveryCodeSchema);

export { RecoveryCodeModel };
export type { RecoveryCodeDocumentType, RecoveryCodeLeanDocument };
