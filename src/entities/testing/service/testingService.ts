import {
  blogsCommandRepository,
  commentsCommandRepository,
  postsCommandRepository,
  requestsCommandRepository,
  sessionsCommandRepository,
  usersCommandRepository,
  recoveryCodesCommandRepository,
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
      recoveryCodesCommandRepository,
    ].map((commandRepository) => commandRepository.cleanAll()),
  );
};

export { cleanDatabase };
