import { LikeStatus } from "../../comments/types";

export class InputPostLikeStatusDto {
  constructor(
    public postId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}
