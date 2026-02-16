import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_DB_NAME } from '../core/config';
import { BlogType } from '../entities/blogs/types';
import { PostType } from '../entities/posts/types';
import { MongoUserType } from '../entities/users/types';
import { log } from '../core/utils/logger/loggerUtils';
import { MongoCommentType } from '../entities/comments/types';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';

let client: MongoClient;
let dbInstance: Db;
let blogsCollection: Collection<BlogType>;
let postsCollection: Collection<PostType>;
let usersCollection: Collection<MongoUserType>;
let commentsCollection: Collection<MongoCommentType>;

async function connectToDB(mongoUri: string) {
  try {
    client = new MongoClient(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    dbInstance = client.db(MONGO_DB_NAME);
    await dbInstance.command({ ping: 1 });
    blogsCollection = dbInstance.collection(BLOGS_COLLECTION_NAME);
    postsCollection = dbInstance.collection(POSTS_COLLECTION_NAME);
    usersCollection = dbInstance.collection(USERS_COLLECTION_NAME);
    commentsCollection = dbInstance.collection(COMMENTS_COLLECTION_NAME);
    log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    await client.close();
    throw new Error(`Database connection error: ${error}`);
  }
}

const closeBbConnection = async () => {
  await client.close();
};

export {
  connectToDB,
  closeBbConnection,
  blogsCollection,
  postsCollection,
  usersCollection,
  commentsCollection,
};
