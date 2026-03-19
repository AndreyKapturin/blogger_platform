import { CommentType, ViewCommentsQuery, ViewCommentType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { CommentLeanDocument, CommentModel } from '../domain/CommentModel';
import { QueryFilter } from 'mongoose';

@injectable()
class CommentsQueryRepository {
  async findById(id: string): Promise<ViewCommentType | null> {
    const foundCommentDocument = await CommentModel.findById(id);
    return foundCommentDocument ? this._commentToViewMapper(foundCommentDocument) : null;
  }

  async findAllForPostWithPagination(postId: string, commentsQuery: ViewCommentsQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = commentsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: QueryFilter<CommentType> = { postId };

    const foundComments: CommentLeanDocument[] = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewComments = foundComments.map(this._commentToViewMapper);

    const totalCount = await CommentModel.countDocuments(filter);

    const paginatedViewComments = toPaginateMapper(viewComments, commentsQuery, totalCount);
    return paginatedViewComments;
  }

  private _commentToViewMapper(commentLeanDocument: CommentLeanDocument): ViewCommentType {
    return {
      id: commentLeanDocument._id.toString(),
      content: commentLeanDocument.content,
      commentatorInfo: commentLeanDocument.commentatorInfo,
      createdAt: commentLeanDocument.createdAt.toISOString(),
    };
  }
}

export { CommentsQueryRepository };
