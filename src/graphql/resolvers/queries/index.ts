import { requiresUser } from '~/graphql/helpers/requiresUser'

import { getBookmark, getBookmarks } from './bookmarks'
import { getComment, getComments } from './comment'
import { getHackerNewsPost, getHackerNewsPosts } from './hackerNews'
import { getHomePage, getPage, getPages } from './pages'
import { getPost, getPosts } from './posts'
import { getQuestion, getQuestions } from './questions'
import { getUserSites, viewSite } from './site'
import { getStack, getStacks } from './stack'
import { getTags } from './tags'
import { getUser } from './user'
import { viewer } from './viewer'

export default {
  viewSite: viewSite,
  userSites: requiresUser(getUserSites),
  viewer: viewer,
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
  stacks: getStacks,
  stack: getStack,
  tags: getTags,
  hackerNewsPosts: getHackerNewsPosts,
  hackerNewsPost: getHackerNewsPost,
}
