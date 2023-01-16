export function getViewerContext(_, __, { viewer, site, userSite, owner }) {
  return {
    viewer,
    site: {
      ...site,
    },
    userSite,
    owner: {
      avatar:
        owner?.avatar || owner?.image || '/static/img/fallback-avatar.png',
    },
  }
}
