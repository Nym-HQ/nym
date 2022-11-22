import { requiresUser } from '~/graphql/helpers/requiresUser'

import { getBookmark, getBookmarks } from './bookmarks'
import { getComment, getComments } from './comment'
import { getHackerNewsPost, getHackerNewsPosts } from './hackerNews'
import { getHomePage, getPage, getPages } from './pages'
import { getPost, getPosts } from './posts'
import { getQuestion, getQuestions } from './questions'
import { getUserSites } from './site'
import { getTags } from './tags'
import { getUser } from './user'
import { getViewerContext } from './viewer'

export default {
  context: getViewerContext,
  userSites: requiresUser(getUserSites),
  user: getUser,
  bookmark: getBookmark,
  bookmarks: getBookmarks,
  pages: getPages,
  page: getPage,
  homepage: getHomePage,
  posts: getPosts,
  post: getPost,
  question: getQuestion,
  questions: getQuestions,
  comment: getComment,
  comments: getComments,
  tags: getTags,
  hackerNewsPosts: getHackerNewsPosts,
  hackerNewsPost: getHackerNewsPost,
}
