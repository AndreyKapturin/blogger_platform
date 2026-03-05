import { sessionCommandRepository } from '../../auth/repositories/sessionCommandRepository';
import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';

const cleanDatabase = async () => {
  await blogsCommandRepository.cleanAll();
  await postsCommandRepository.cleanAll();
  await usersCommandRepository.cleanAll();
  await sessionCommandRepository.cleanAll();
};

export { cleanDatabase };
