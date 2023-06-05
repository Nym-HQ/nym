import { requiresSiteAdmin } from '~/graphql/helpers/requiresSiteAdmin'
import { requiresUser } from '~/graphql/helpers/requiresUser'

import { getBookmark, getBookmarks } from './bookmarks'
import { getComment, getComments } from './comment'
import { getEmailSubscriptions } from './emailSubscriptions'
import { getHomePage, getPage, getPages } from './pages'
import { getPost, getPosts } from './posts'
import { getQuestion, getQuestions } from './questions'
import { getSiteSettings, getSiteUsers, getUserSites } from './site'
import { getTags } from './tags'
import { getUser } from './user'
import { getViewerContext } from './viewer'

export default {
  context: getViewerContext,
  siteSettings: requiresSiteAdmin(getSiteSettings),
  userSites: requiresUser(getUserSites),
  siteUsers: requiresUser(getSiteUsers),
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
  emailSubscriptions: getEmailSubscriptions,
}
