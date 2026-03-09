import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_DB_NAME } from '../core/config';
import { BlogType } from '../entities/blogs/types';
import { PostType } from '../entities/posts/types';
import { MongoUserType } from '../entities/users/types';
import { log } from '../core/utils/logger/loggerUtils';
import { MongoCommentType } from '../entities/comments/types';
import { Session } from '../entities/auth/types';
import { RequestType } from '../entities/requests/types';
import { RATE_LIMIT_WINDOW_IN_SECONDS } from '../entities/requests/constants';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const SESSION_COLLECTION_NAME = 'session';
const REQUESTS_COLLECTION_NAME = 'requests';

let client: MongoClient;
let dbInstance: Db;
let blogsCollection: Collection<BlogType>;
let postsCollection: Collection<PostType>;
let usersCollection: Collection<MongoUserType>;
let commentsCollection: Collection<MongoCommentType>;
let sessionsCollection: Collection<Session>;
let requestsCollection: Collection<RequestType>;

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
    sessionsCollection = dbInstance.collection(SESSION_COLLECTION_NAME);
    requestsCollection = dbInstance.collection(REQUESTS_COLLECTION_NAME);

    await sessionsCollection.createIndex({ expirationDate: 1 }, { expireAfterSeconds: 0 });

    await requestsCollection.createIndex(
      { date: 1 },
      { expireAfterSeconds: RATE_LIMIT_WINDOW_IN_SECONDS },
    );

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
  sessionsCollection,
  requestsCollection,
};
