import { BlogType, ViewBlogQuery, ViewBlogType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { BlogModel, BlogLeanDocument } from '../domain/BlogModel';
import { QueryFilter } from 'mongoose';

@injectable()
class BlogsQueryRepository {
  async findAllWithPagination(blogQuery: ViewBlogQuery) {
    const filter: QueryFilter<BlogType> = {};
    const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = blogQuery;

    const skip = (pageNumber - 1) * pageSize;

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const foundBlogs: BlogLeanDocument[] = await BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewBlogs: ViewBlogType[] = foundBlogs.map(this._blogToViewMapper);
    const totalCount = await BlogModel.countDocuments(filter);

    const paginatedViewBlogs = toPaginateMapper(viewBlogs, blogQuery, totalCount);
    return paginatedViewBlogs;
  }

  async findById(id: string) {
    const foundBlogLeanDocument = await BlogModel.findById(id).lean();
    return foundBlogLeanDocument ? this._blogToViewMapper(foundBlogLeanDocument) : null;
  }

  private _blogToViewMapper(blogLeanDocument: BlogLeanDocument): ViewBlogType {
    return {
      id: blogLeanDocument._id.toString(),
      name: blogLeanDocument.name,
      createdAt: blogLeanDocument.createdAt.toISOString(),
      isMembership: blogLeanDocument.isMembership,
      description: blogLeanDocument.description,
      websiteUrl: blogLeanDocument.websiteUrl,
    };
  }
}
export { BlogsQueryRepository };
