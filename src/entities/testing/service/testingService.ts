import { blogsRepository } from '../../blogs/repository/blogsRepository';
import { postsRepository } from '../../posts/repository/postsRepository';

const cleanDatabase = async () => {
  await blogsRepository.cleanAll();
  await postsRepository.cleanAll();
};

export { cleanDatabase };
