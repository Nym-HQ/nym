import gql from 'graphql-tag'

const typeDefs = gql`
  scalar Date

  type Site {
    id: ID!
    subdomain: String
    parkedDomain: String
    plan: String
    name: String
    description: String
    logo: String
    banner: String
    attach_css: String
    attach_js: String
    newsletter_provider: String
    newsletter_setting1: String
    newsletter_setting2: String
    newsletter_setting3: String
    social_twitter: String
    social_youtube: String
    social_github: String
    social_other1: String
    social_other1_label: String
  }

  enum SiteRole {
    BLOCKED
    USER
    ADMIN
    OWNER
  }

  type UserSite {
    id: ID!
    userId: String
    siteRole: SiteRole
    site: Site
  }

  type SiteOwner {
    avatar: String
    image: String
  }

  type Page {
    id: ID!
    createdAt: Date
    updatedAt: Date
    publishedAt: Date
    author: User
    title: String
    slug: String
    path: String
    text: String
    data: String
    excerpt: String
    featureImage: String
    featured: Boolean
  }

  type Post {
    id: ID!
    createdAt: Date
    updatedAt: Date
    publishedAt: Date
    author: User
    title: String
    slug: String
    text: String
    data: String
    excerpt: String
    featureImage: String
    reactionCount: Int
    viewerHasReacted: Boolean
  }

  type Bookmark {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    url: String!
    host: String!
    title: String
    image: String
    faviconUrl: String
    description: String
    tags: [Tag]!
    reactionCount: Int
    viewerHasReacted: Boolean
  }

  type Question {
    id: ID!
    createdAt: Date!
    updatedAt: Date
    author: User
    title: String!
    description: String
    status: QuestionStatus
    viewerCanEdit: Boolean
    viewerCanComment: Boolean
    reactionCount: Int
    viewerHasReacted: Boolean
  }

  enum CommentType {
    BOOKMARK
    QUESTION
    POST
  }

  enum ReactionType {
    BOOKMARK
    QUESTION
    POST
  }

  type Tag {
    name: String!
  }

  enum UserRole {
    BLOCKED
    USER
    ADMIN
  }

  enum EmailSubscriptionType {
    NEWSLETTER
  }

  type EmailSubscription {
    email: String
    type: EmailSubscriptionType
    userId: String
  }

  type UserEmailSubscription {
    type: EmailSubscriptionType
    subscribed: Boolean
  }

  type User {
    id: ID!
    createdAt: Date
    role: UserRole
    username: String
    image: String
    avatar: String
    email: String
    pendingEmail: String
    name: String
    description: String
    location: String
    social_twitter: String
    social_youtube: String
    social_github: String
    social_other1: String
    social_other1_label: String
    emailSubscriptions: [UserEmailSubscription]

    isAdmin: Boolean
  }

  type Comment {
    id: ID!
    createdAt: Date!
    updatedAt: Date
    text: String
    author: User!
    viewerCanEdit: Boolean
    viewerCanDelete: Boolean
  }

  input BookmarkFilter {
    tag: String
    host: String
  }

  enum QuestionStatus {
    ANSWERED
    PENDING
  }

  input WritingFilter {
    published: Boolean
  }

  input PagesFilter {
    includeHomepage: Boolean
    featuredOnly: Boolean
    published: Boolean
  }

  input QuestionFilter {
    status: QuestionStatus
  }

  type BookmarkEdge {
    node: Bookmark
    cursor: String
  }

  type QuestionEdge {
    node: Question
    cursor: String
  }

  type EmailSubscriptionEdge {
    node: EmailSubscription
    cursor: String
  }

  type PageInfo {
    hasNextPage: Boolean
    totalCount: Int
    endCursor: String
  }

  type BookmarksConnection {
    pageInfo: PageInfo
    edges: [BookmarkEdge]!
  }

  type QuestionsConnection {
    pageInfo: PageInfo
    edges: [QuestionEdge]!
  }

  type EmailSubscriptionsConnection {
    pageInfo: PageInfo
    edges: [EmailSubscriptionEdge]!
  }


  type ViewerContext {
    viewer: User
    site: Site
    userSite: UserSite
    owner: SiteOwner
  }

  type Query {
    context: ViewerContext!
    userSites: [UserSite!]
    user(username: String!): User
    bookmark(id: ID!): Bookmark
    bookmarks(
      first: Int
      after: String
      filter: BookmarkFilter
    ): BookmarksConnection!
    comment(id: ID!): Comment
    comments(refId: ID!, type: CommentType!): [Comment]!
    pages(filter: PagesFilter): [Page]!
    page(slug: String!): Page
    homepage: Page
    posts(filter: WritingFilter): [Post]!
    post(slug: String!): Post
    question(id: ID!): Question
    questions(
      first: Int
      after: String
      filter: QuestionFilter
    ): QuestionsConnection!
    tags: [Tag]!
    emailSubscriptions(
      first: Int
      after: String
    ): EmailSubscriptionsConnection!
  }

  input EditUserInput {
    username: String
    email: String
  }

  input EmailSubscriptionInput {
    type: EmailSubscriptionType!
    subscribed: Boolean!
    email: String
  }

  input AddBookmarkInput {
    url: String!
    tag: String
  }

  input EditBookmarkInput {
    title: String!
    description: String
    tag: String
    faviconUrl: String
  }

  input EditQuestionInput {
    title: String!
    description: String
  }

  input AddQuestionInput {
    title: String!
    description: String
  }

  input AddPageInput {
    title: String!
    text: String!
    data: String!
    path: String!
    slug: String!
    excerpt: String
    featured: Boolean
  }

  input EditPageInput {
    title: String!
    text: String!
    data: String!
    path: String!
    slug: String!
    excerpt: String
    published: Boolean
    featured: Boolean
    publishedAt: Date
  }

  input AddPostInput {
    title: String!
    text: String!
    data: String!
    slug: String!
    excerpt: String
  }

  input EditPostInput {
    title: String!
    text: String!
    data: String!
    slug: String!
    excerpt: String
    published: Boolean
    publishedAt: Date
  }

  input AddSiteInput {
    subdomain: String!
  }

  input EditSiteDomainInput {
    parkedDomain: String!
  }

  input EditSiteInput {
    name: String
    description: String
    logo: String
    banner: String
    attach_css: String
    attach_js: String
    newsletter_provider: String
    newsletter_setting1: String
    newsletter_setting2: String
    newsletter_setting3: String
    social_twitter: String
    social_youtube: String
    social_github: String
    social_other1: String
    social_other1_label: String
  }

  union Reactable = Bookmark | Question | Post

  type Mutation {
    addBookmark(data: AddBookmarkInput!): Bookmark
    editBookmark(id: ID!, data: EditBookmarkInput!): Bookmark
    deleteBookmark(id: ID!): Boolean
    addQuestion(data: AddQuestionInput!): Question
    editQuestion(id: ID!, data: EditQuestionInput!): Question
    deleteQuestion(id: ID!): Boolean
    addComment(refId: ID!, type: CommentType!, text: String!): Comment
    editComment(id: ID!, text: String): Comment
    deleteComment(id: ID!): Boolean
    editUser(data: EditUserInput): User
    deleteUser: Boolean
    editEmailSubscription(data: EmailSubscriptionInput): User
    addPage(data: AddPageInput!): Page
    editPage(id: ID!, data: EditPageInput!): Page
    deletePage(id: ID!): Boolean
    addPost(data: AddPostInput!): Post
    editPost(id: ID!, data: EditPostInput!): Post
    deletePost(id: ID!): Boolean
    toggleReaction(refId: ID!, type: ReactionType!): Reactable
    addSite(data: AddSiteInput!): Site
    editSiteDomain(subdomain: String!, data: EditSiteDomainInput!): Site
    editSite(subdomain: String!, data: EditSiteInput!): Site
    deleteSite(subdomain: String!): Boolean
  }
`

export default typeDefs
