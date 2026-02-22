export const Routes = {
  Index: '/',
  Auth: '/auth',
  Me: '/me',
  Login: '/login',
  Registration: '/registration',
  EmailResending: '/registration-email-resending',
  RegistrationConfirmation: '/registration-confirmation',
  RefreshToken: '/refresh-token',
  Logout: '/logout',
  Blogs: '/blogs',
  Posts: '/posts',
  Comments: '/comments',
  Users: '/users',
  Testing: '/testing',
  AllData: '/all-data',
  Docs: '/docs',

  get AuthLogin() {
    return `${this.Auth}${this.Login}`;
  },
  get AuthMe() {
    return `${this.Auth}${this.Me}`;
  },
  get AuthRegistration() {
    return `${this.Auth}${this.Registration}`;
  },
  get AuthEmailResending() {
    return `${this.Auth}${this.EmailResending}`;
  },
  get AuthRegistrationConfirmation() {
    return `${this.Auth}${this.RegistrationConfirmation}`;
  },
  get AuthRefreshToken() {
    return `${this.Auth}${this.RefreshToken}`;
  },
  get AuthLogout() {
    return `${this.Auth}${this.Logout}`;
  },

  get TestingAllData() {
    return `${this.Testing}${this.AllData}`;
  },

  BlogById(id: string) {
    return `${this.Blogs}/${id}`;
  },
  BlogIdPosts(id: string) {
    return `/${id}/${this.Posts}`;
  },
  BlogPostsById(id: string) {
    return `${this.Blogs}/${id}/${this.Posts}`;
  },

  PostById(id: string) {
    return `${this.Posts}/${id}`;
  },
  PostIdComments(id: string) {
    return `/${id}/${this.Comments}`;
  },
  PostCommentsById(id: string) {
    return `${this.Posts}/${id}/${this.Comments}`;
  },

  CommentById(id: string) {
    return `${this.Comments}/${id}`;
  },

  UserById(id: string) {
    return `${this.Users}/${id}`;
  },

  ById(id: string) {
    return `/${id}`;
  },
};
