const routes = {
  writing: {
    label: 'Posts',
    path: '/writing',
    seo: {
      title: 'Writing',
      description: 'Express yourself.',
      image: 'og/writing.png',
      url: 'writing',
    },
  },
  bookmarks: {
    label: 'Links',
    path: '/bookmarks',
    seo: {
      title: 'Bookmarks',
      description: 'Internet things, saved for later.',
      image: 'og/bookmarks.png',
      url: 'bookmarks',
    },
  },
  ama: {
    label: 'Q&A',
    path: '/qa',
    seo: {
      title: 'Q&A',
      description: 'Q&A',
      image: 'og/ama.png',
      url: 'ama',
    },
  },
  pages: {
    label: 'Pages',
    path: '/pages',
    seo: {
      title: 'Pages',
      description: 'Navigate to published pages',
      image: 'og/writing.png',
      url: 'writing',
    },
  },
  profile: {
    label: 'Profile',
    path: '/profile',
    seo: {
      title: 'Profile',
      description: 'Manage your profile.',
      image: 'og/settings.png',
      url: 'profile',
    },
  },
}

export default routes
