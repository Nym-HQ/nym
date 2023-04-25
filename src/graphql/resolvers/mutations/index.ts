import { requiresAdmin } from '~/graphql/helpers/requiresAdmin'
import { requiresSiteAdmin } from '~/graphql/helpers/requiresSiteAdmin'
import { requiresUser } from '~/graphql/helpers/requiresUser'
import {
  addBookmark,
  deleteBookmark,
  editBookmark,
} from '~/graphql/resolvers/mutations/bookmarks'
import {
  addComment,
  deleteComment,
  editComment,
} from '~/graphql/resolvers/mutations/comment'
import { editEmailSubscription } from '~/graphql/resolvers/mutations/emailSubscription'
import {
  addPage,
  deletePage,
  editPage,
} from '~/graphql/resolvers/mutations/page'
import {
  addPost,
  deletePost,
  editPost,
} from '~/graphql/resolvers/mutations/post'
import {
  addQuestion,
  deleteQuestion,
  editQuestion,
} from '~/graphql/resolvers/mutations/questions'
import { toggleReaction } from '~/graphql/resolvers/mutations/reactions'
import {
  addSite,
  deleteSite,
  editSite,
  editSiteDomain,
  editSiteUser,
} from '~/graphql/resolvers/mutations/site'
import { deleteUser, editUser } from '~/graphql/resolvers/mutations/user'

export default {
  addBookmark: requiresAdmin(addBookmark),
  editBookmark: requiresAdmin(editBookmark),
  deleteBookmark: requiresAdmin(deleteBookmark),
  addQuestion: requiresUser(addQuestion),
  editQuestion: requiresUser(editQuestion),
  deleteQuestion: requiresUser(deleteQuestion),
  addComment: requiresUser(addComment),
  editComment: requiresUser(editComment),
  deleteComment: requiresUser(deleteComment),
  deleteUser: requiresUser(deleteUser),
  editUser: requiresUser(editUser),
  editEmailSubscription: editEmailSubscription,
  addPage: requiresAdmin(addPage),
  editPage: requiresAdmin(editPage),
  deletePage: requiresAdmin(deletePage),
  addPost: requiresAdmin(addPost),
  editPost: requiresAdmin(editPost),
  deletePost: requiresAdmin(deletePost),
  toggleReaction: requiresUser(toggleReaction),
  addSite: requiresUser(addSite),
  editSiteDomain: requiresSiteAdmin(editSiteDomain),
  editSite: requiresSiteAdmin(editSite),
  deleteSite: requiresSiteAdmin(deleteSite),
  editSiteUser: requiresSiteAdmin(editSiteUser),
}
