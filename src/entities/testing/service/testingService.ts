import { sessionCommandRepository } from '../../auth/repositories/sessionCommandRepository';
import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { commentsCommandRepository } from '../../comments/repositories/commentsCommandRepository';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { requestsCommandRepository } from '../../requests/repositories/requestsCommandRepository';
import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';

const cleanDatabase = async () => {
  await Promise.all(
    [
      blogsCommandRepository,
      postsCommandRepository,
      usersCommandRepository,
      commentsCommandRepository,
      sessionCommandRepository,
      requestsCommandRepository,
    ].map((commandRepository) => commandRepository.cleanAll()),
  );
};

export { cleanDatabase };
