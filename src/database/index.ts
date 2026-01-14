import { BlogType } from '../entities/blogs/types';

type DB = {
  [k: string]: object[];
  blogs: BlogType[];
};

const database: DB = {
  blogs: [],
};

const cleanDatabase = () => {
  for (const tableName in database) {
    database[tableName] = [];
  }
};

export { database, cleanDatabase };
