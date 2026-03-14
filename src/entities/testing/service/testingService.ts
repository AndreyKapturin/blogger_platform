import { container } from '../../../compositionRoot';
import { RecoveryCodesCommandRepository } from '../../auth/repositories/RecoveryCodesCommandRepository';
import { SessionsCommandRepository } from '../../auth/repositories/sessionsCommandRepository';
import { BlogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { CommentsCommandRepository } from '../../comments/repositories/commentsCommandRepository';
import { PostsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { RequestsCommandRepository } from '../../requests/repositories/requestsCommandRepository';
import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';

const blogsCommandRepository = container.get(BlogsCommandRepository);
const commentsCommandRepository = container.get(CommentsCommandRepository);
const postsCommandRepository = container.get(PostsCommandRepository);
const requestsCommandRepository = container.get(RequestsCommandRepository);
const sessionsCommandRepository = container.get(SessionsCommandRepository);
const usersCommandRepository = container.get(UsersCommandRepository);
const recoveryCodesCommandRepository = container.get(RecoveryCodesCommandRepository);

const cleanDatabase = async () => {
  await Promise.all(
    [
      blogsCommandRepository,
      postsCommandRepository,
      usersCommandRepository,
      commentsCommandRepository,
      sessionsCommandRepository,
      requestsCommandRepository,
      recoveryCodesCommandRepository,
    ].map((commandRepository) => commandRepository.cleanAll()),
  );
};

export { cleanDatabase };
