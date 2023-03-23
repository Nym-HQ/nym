export function getViewerContext(_, __, { viewer, site, userSite, owner }) {
  return {
    viewer,
    site,
    userSite,
    owner: {
      avatar: owner?.avatar,
      image: owner?.image,
      hasEmail: owner?.hasEmail,
    },
  }
}
