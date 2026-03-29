import { LikeStatus } from '../comments/types';

type ReactionType = {
  status: LikeStatus;
  userId: string;
  login: string;
  parentId: string;
  addedAt: Date;
};

export type { ReactionType };
