import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';

const cleanDatabase = async () => {
  await blogsCommandRepository.cleanAll();
  await postsCommandRepository.cleanAll();
  await usersCommandRepository.cleanAll();
};

export { cleanDatabase };
