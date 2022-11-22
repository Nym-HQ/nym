import { NextPageContext } from 'next'
import * as React from 'react'

import { useContextQuery } from '~/graphql/types.generated'
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
  const { data } = useContextQuery()

  const initialState = {
    ...globalSiteContext,
  }

  const [state, setState] = React.useState(initialState)

  function setSite(site) {
    return setState({ ...state, ...site })
  }

  React.useEffect(() => {
    if (data?.context?.site) {
      setSite({
        siteId: data?.context?.site?.id,
        subdomain: data?.context?.site.subdomain,
        domain: window.location.host,
        isAppDomain: window.location.host === MAIN_APP_DOMAIN,
        unparkedSubdomain: !data?.context?.site?.id,
      })
    } else if (data?.context?.site) {
      setSite({
        siteId: data?.context?.site?.id,
        subdomain: data?.context?.site?.subdomain,
        domain: window.location.host,
        isAppDomain: window.location.host === MAIN_APP_DOMAIN,
        unparkedSubdomain: !data?.context?.site?.id,
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
