import { defaultSEO, extendSEO } from './seo'

const routes = {
  home: {
    label: 'Home',
    path: '/',
    seo: defaultSEO,
  },
  about: {
    label: 'About',
    path: '/about',
    seo: extendSEO({
      title: 'About',
      url: 'about',
    }),
  },
  writing: {
    label: 'Writing',
    path: '/writing',
    seo: extendSEO({
      title: 'Writing',
      description: 'Thinking out loud about software design and development.',
      image: 'og/writing.png',
      url: 'writing',
    }),
  },
  bookmarks: {
    label: 'Bookmarks',
    path: '/bookmarks',
    seo: extendSEO({
      title: 'Bookmarks',
      description: 'Internet things, saved for later.',
      image: 'og/bookmarks.png',
      url: 'bookmarks',
    }),
  },
  ama: {
    label: 'Q&A',
    path: '/qa',
    seo: extendSEO({
      title: 'Q&A',
      description: 'Q&A',
      image: 'og/ama.png',
      url: 'ama',
    }),
  },
  pages: {
    label: 'Pages',
    path: '/pages',
    seo: extendSEO({
      title: 'Pages',
      description: 'Navigate to published pages',
      image: 'og/writing.png',
      url: 'writing',
    }),
  },
  settings: {
    label: 'Settings',
    path: '/settings',
    seo: extendSEO({
      title: 'Settings',
      description: 'Manage your profile.',
      image: 'og/settings.png',
      url: 'settings',
    }),
  },
}

export default routes
