import {
  CommentType,
  LikesInfoType,
  LikeStatus,
  ViewCommentsQuery,
  ViewCommentType,
} from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { CommentLeanDocument, CommentModel } from '../domain/CommentModel';
import { QueryFilter } from 'mongoose';
import { Paginator } from '../../../core/types/PaginationAndSorting';

@injectable()
class CommentsQueryRepository {
  async findById(id: string, userId?: string): Promise<ViewCommentType | null> {
    const foundCommentDocument = await CommentModel.findById(id);
    
    if (!foundCommentDocument) return null;
    if (userId) return this._commentForUserToViewMapper(foundCommentDocument, userId);
    return this._commentToViewMapper(foundCommentDocument);
  }

  async findAllForPostWithPagination(
    postId: string,
    commentsQuery: ViewCommentsQuery,
    userId?: string,
  ): Promise<Paginator<ViewCommentType>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = commentsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: QueryFilter<CommentType> = { postId };

    const foundComments: CommentLeanDocument[] = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    let viewComments: ViewCommentType[];

    if (userId) {
      viewComments = foundComments.map((c) => this._commentForUserToViewMapper(c, userId));
    } else {
      viewComments = foundComments.map(this._commentToViewMapper);
    }

    const totalCount = await CommentModel.countDocuments(filter);

    const paginatedViewComments = toPaginateMapper(viewComments, commentsQuery, totalCount);
    return paginatedViewComments;
  }

  private _commentToViewMapper(commentLeanDocument: CommentLeanDocument): ViewCommentType {
    return {
      id: commentLeanDocument._id.toString(),
      content: commentLeanDocument.content,
      commentatorInfo: commentLeanDocument.commentatorInfo,
      likesInfo: {
        likesCount: commentLeanDocument.likesInfo.likesUserIds.length,
        dislikesCount: commentLeanDocument.likesInfo.dislikesUserIds.length,
        myStatus: LikeStatus.None,
      },
      createdAt: commentLeanDocument.createdAt.toISOString(),
    };
  }

  private _commentForUserToViewMapper(
    commentLeanDocument: CommentLeanDocument,
    userId: string,
  ): ViewCommentType {
    return {
      id: commentLeanDocument._id.toString(),
      content: commentLeanDocument.content,
      commentatorInfo: commentLeanDocument.commentatorInfo,
      likesInfo: {
        likesCount: commentLeanDocument.likesInfo.likesUserIds.length,
        dislikesCount: commentLeanDocument.likesInfo.dislikesUserIds.length,
        myStatus: this._getCurrentUserLikeStatus(commentLeanDocument.likesInfo, userId),
      },
      createdAt: commentLeanDocument.createdAt.toISOString(),
    };
  }

  private _getCurrentUserLikeStatus(likesInfo: LikesInfoType, userId: string): LikeStatus {
    const isLike = likesInfo.likesUserIds.includes(userId);
    if (isLike) return LikeStatus.Like;
    const isDislike = likesInfo.dislikesUserIds.includes(userId);
    if (isDislike) return LikeStatus.Dislike;
    return LikeStatus.None;
  }
}

export { CommentsQueryRepository };
