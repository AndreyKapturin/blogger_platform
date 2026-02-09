import { Filter, ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { BlogType, ViewBlogQuery, ViewBlogType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';

const findAllWithPagination = async (blogQuery: ViewBlogQuery) => {
  const filter: Filter<BlogType> = {};
  const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = blogQuery;

  const skip = (pageNumber - 1) * pageSize;

  if (searchNameTerm) {
    filter.name = { $regex: searchNameTerm, $options: 'i' };
  }

  const foundBlogs = await blogsCollection
    .find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(pageSize)
    .map(_blogToViewMapper)
    .toArray();

  const totalCount = await blogsCollection.countDocuments(filter);
  const paginatedViewBlogs = toPaginateMapper(foundBlogs, blogQuery, totalCount);
  return paginatedViewBlogs
};

const getRawBlogsHandler = async () => blogsCollection.find().map(_blogToViewMapper).toArray();

const findById = async (blogId: string) => {
  const foundBlog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  return foundBlog ? _blogToViewMapper(foundBlog) : null;
};

const _blogToViewMapper = (mongoBlog: WithId<BlogType>): ViewBlogType => {
  return {
    id: mongoBlog._id.toString(),
    name: mongoBlog.name,
    createdAt: mongoBlog.createdAt,
    isMembership: mongoBlog.isMembership,
    description: mongoBlog.description,
    websiteUrl: mongoBlog.websiteUrl,
  };
};

const blogsQueryRepository = {
  getRawBlogsHandler,
  findAllWithPagination,
  findById,
};
export { blogsQueryRepository };
