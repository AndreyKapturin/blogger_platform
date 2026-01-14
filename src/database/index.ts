import { BlogType } from '../entities/blogs/types';
import { PostType } from '../entities/posts/types';

type DB = {
  [k: string]: object[];
  blogs: BlogType[];
  posts: PostType[]
};

const database: DB = {
  blogs: [],
  posts: []
};

const cleanDatabase = () => {
  for (const tableName in database) {
    database[tableName] = [];
  }
};

export { database, cleanDatabase };
