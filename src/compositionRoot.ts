import { CryptoService } from './core/utils/crypto/passwordUtils';
import { JwtService } from './core/utils/jwt/jwtUtils';
import { AuthService } from './entities/auth/application/authService';
import { AuthController } from './entities/auth/controller/AuthController';
import { SessionsCommandRepository } from './entities/auth/repositories/sessionsCommandRepository';
import { SessionsQueryRepository } from './entities/auth/repositories/sessionsQueryRepository';
import { BlogsService } from './entities/blogs/application/blogsService';
import { BlogsCommandRepository } from './entities/blogs/repositories/blogsCommandRepository';
import { BlogsQueryRepository } from './entities/blogs/repositories/blogsQueryRepository';
import { CommentsService } from './entities/comments/application/commentsService';
import { CommentsCommandRepository } from './entities/comments/repositories/commentsCommandRepository';
import { CommentsQueryRepository } from './entities/comments/repositories/commentsQueryRepository';
import { PostsService } from './entities/posts/application/postsService';
import { PostsCommandRepository } from './entities/posts/repositories/postsCommandRepository';
import { PostsQueryRepository } from './entities/posts/repositories/postsQueryRepository';
import { RequestsCommandRepository } from './entities/requests/repositories/requestsCommandRepository';
import { DevicesService } from './entities/security/application/devicesService';
import { UsersService } from './entities/users/application/usersService';
import { UsersCommandRepository } from './entities/users/repositories/usersCommandRepository';
import { UsersQueryRepository } from './entities/users/repositories/usersQueryRepository';

export const blogsCommandRepository = new BlogsCommandRepository();
export const blogsQueryRepository = new BlogsQueryRepository();

export const usersCommandRepository = new UsersCommandRepository();
export const usersQueryRepository = new UsersQueryRepository();

export const sessionsCommandRepository = new SessionsCommandRepository();
export const sessionsQueryRepository = new SessionsQueryRepository();

export const postsCommandRepository = new PostsCommandRepository();
export const postsQueryRepository = new PostsQueryRepository();

export const commentsCommandRepository = new CommentsCommandRepository();
export const commentsQueryRepository = new CommentsQueryRepository();

export const requestsCommandRepository = new RequestsCommandRepository();

export const cryptoService = new CryptoService();
export const jwtService = new JwtService();

export const blogsService = new BlogsService(blogsCommandRepository, postsCommandRepository);
export const postsService = new PostsService(blogsCommandRepository, postsCommandRepository);
export const usersService = new UsersService(usersCommandRepository);
export const commentsService = new CommentsService(
  postsCommandRepository,
  usersCommandRepository,
  commentsCommandRepository,
);
export const devicesService = new DevicesService(jwtService, sessionsCommandRepository);
export const authService = new AuthService(
  usersCommandRepository,
  cryptoService,
  jwtService,
  sessionsCommandRepository,
);

export const authController = new AuthController(usersQueryRepository, authService);
