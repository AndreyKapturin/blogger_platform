import mongoose from 'mongoose';

type LeanDocument<T> = T & {
  _id: mongoose.Types.ObjectId;
  __v: number;
};

export type { LeanDocument };
