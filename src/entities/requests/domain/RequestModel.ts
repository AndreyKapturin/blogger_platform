import mongoose from 'mongoose';
import { RequestType } from '../types';
import { LeanDocument } from '../../../database/types';

type RequestDocumentType = mongoose.HydratedDocument<RequestType>;
type RequestLeanDocument = LeanDocument<RequestType>;

const requestSchema = new mongoose.Schema<RequestType>({
  date: { type: 'Date', required: true },
  ip: { type: 'String', required: true },
  url: { type: 'String', required: true },
});

const RequestModel = mongoose.model<RequestType>('Request', requestSchema);

export { RequestModel };
export type { RequestDocumentType, RequestLeanDocument };
