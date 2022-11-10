import { NextPageContext } from 'next'
import * as React from 'react'

import { useViewerQuery, useViewSiteQuery } from '~/graphql/types.generated'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

interface Props {
  children?: any
  pageProps: NextPageContext
}

const globalSiteContext = {
  isAppDomain: false,
  subdomain: '',
  domain: '',
  siteId: null,
  unparkedSubdomain: false,
}

export const GlobalSiteContext = React.createContext(globalSiteContext)

export function GlobalSiteContextProvider({ children, pageProps }: Props) {
  const { data } = useViewerQuery()
  const { data: siteData } = useViewSiteQuery()

  const initialState = {
    ...globalSiteContext,
  }

  const [state, setState] = React.useState(initialState)

  function setSite(site) {
    return setState({ ...state, ...site })
  }

  React.useEffect(() => {
    if (siteData?.viewSite) {
      setSite({
        siteId: siteData.viewSite.id,
        subdomain: siteData.viewSite.subdomain,
        domain: window.location.host,
        isAppDomain: window.location.host === MAIN_APP_DOMAIN,
        unparkedSubdomain: !siteData.viewSite.id,
      })
    } else if (data?.viewer?.viewerSite) {
      setSite({
        siteId: data.viewer.viewerSite.id,
        subdomain: data.viewer.viewerSite.subdomain,
        domain: window.location.host,
        isAppDomain: window.location.host === MAIN_APP_DOMAIN,
        unparkedSubdomain: !data.viewer.viewerSite.id,
      })
    } else {
      setSite({
        domain: window.location.host,
        isAppDomain: window.location.host === MAIN_APP_DOMAIN,
        unparkedSubdomain: window.location.host !== MAIN_APP_DOMAIN,
      })
    }
  }, [data])

  return (
    <GlobalSiteContext.Provider value={state}>
      {children}
    </GlobalSiteContext.Provider>
  )
}
