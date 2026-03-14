import { Container } from 'inversify';
import { EmailService } from './core/services/emailService';
import { CryptoService } from './core/utils/crypto/passwordUtils';
import { JwtService } from './core/utils/jwt/jwtUtils';
import { AuthService } from './entities/auth/application/authService';
import { AuthController } from './entities/auth/controller/AuthController';
import { RecoveryCodesCommandRepository } from './entities/auth/repositories/RecoveryCodesCommandRepository';
import { SessionsCommandRepository } from './entities/auth/repositories/sessionsCommandRepository';
import { SessionsQueryRepository } from './entities/auth/repositories/sessionsQueryRepository';
import { BlogsService } from './entities/blogs/application/blogsService';
import { BlogsController } from './entities/blogs/controller/BlogsContoller';
import { BlogsCommandRepository } from './entities/blogs/repositories/blogsCommandRepository';
import { BlogsQueryRepository } from './entities/blogs/repositories/blogsQueryRepository';
import { CommentsService } from './entities/comments/application/commentsService';
import { CommentsController } from './entities/comments/controller/CommentsController';
import { CommentsCommandRepository } from './entities/comments/repositories/commentsCommandRepository';
import { CommentsQueryRepository } from './entities/comments/repositories/commentsQueryRepository';
import { PostsService } from './entities/posts/application/postsService';
import { PostsController } from './entities/posts/controller/PostsController';
import { PostsCommandRepository } from './entities/posts/repositories/postsCommandRepository';
import { PostsQueryRepository } from './entities/posts/repositories/postsQueryRepository';
import { RequestsCommandRepository } from './entities/requests/repositories/requestsCommandRepository';
import { DevicesService } from './entities/security/application/devicesService';
import { SecurityController } from './entities/security/controller/SecurityController';
import { UsersService } from './entities/users/application/usersService';
import { UsersController } from './entities/users/controller/UsersController';
import { UsersCommandRepository } from './entities/users/repositories/usersCommandRepository';
import { UsersQueryRepository } from './entities/users/repositories/usersQueryRepository';
import { UsersFactory } from './entities/users/UsersFactory';

export const container = new Container();

[
  BlogsCommandRepository,
  BlogsQueryRepository,
  UsersCommandRepository,
  UsersQueryRepository,
  SessionsCommandRepository,
  SessionsQueryRepository,
  PostsCommandRepository,
  PostsQueryRepository,
  CommentsCommandRepository,
  CommentsQueryRepository,
  RequestsCommandRepository,
  RecoveryCodesCommandRepository,
  CryptoService,
  JwtService,
  EmailService,
  UsersFactory,
  BlogsService,
  PostsService,
  UsersService,
  CommentsService,
  DevicesService,
  AuthService,
  AuthController,
  BlogsController,
  CommentsController,
  PostsController,
  SecurityController,
  UsersController,
].forEach((dependencyClass) => container.bind(dependencyClass).toSelf().inSingletonScope());
