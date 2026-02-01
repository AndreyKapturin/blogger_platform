import { blogsRepository } from '../../blogs/repository/blogsRepository';
import { postsRepository } from '../../posts/repository/postsRepository';
import { usersRepository } from '../../users/repositories/commandRepository';

const cleanDatabase = async () => {
  await blogsRepository.cleanAll();
  await postsRepository.cleanAll();
  await usersRepository.cleanAll();
};

export { cleanDatabase };
