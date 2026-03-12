import {
  blogsCommandRepository,
  commentsCommandRepository,
  postsCommandRepository,
  requestsCommandRepository,
  sessionsCommandRepository,
  usersCommandRepository,
} from '../../../compositionRoot';

const cleanDatabase = async () => {
  await Promise.all(
    [
      blogsCommandRepository,
      postsCommandRepository,
      usersCommandRepository,
      commentsCommandRepository,
      sessionsCommandRepository,
      requestsCommandRepository,
    ].map((commandRepository) => commandRepository.cleanAll()),
  );
};

export { cleanDatabase };
