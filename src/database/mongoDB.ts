import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_CONNECTION_URI, MONGO_DB_NAME } from '../core/config';
import { BlogType } from '../entities/blogs/types';
import { PostType } from '../entities/posts/types';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';

const client = new MongoClient(MONGO_CONNECTION_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbInstance: Db;
let blogsCollection: Collection<BlogType>;
let postsCollection: Collection<PostType>;

async function connectToDB() {
  try {
    await client.connect();
    dbInstance = client.db(MONGO_DB_NAME)
    await dbInstance.command({ ping: 1 });
    blogsCollection = dbInstance.collection(BLOGS_COLLECTION_NAME)
    postsCollection = dbInstance.collection(POSTS_COLLECTION_NAME)
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    await client.close();
    throw new Error(`Database connection error: ${error}`);
  }
}

const closeBbConnection = async () => {
  await client.close();
}


export { connectToDB, closeBbConnection, blogsCollection, postsCollection }
