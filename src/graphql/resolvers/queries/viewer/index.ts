export function getViewerContext(_, __, { viewer, site, userSite }) {
  return {
    viewer,
    site,
    userSite,
  }
}
