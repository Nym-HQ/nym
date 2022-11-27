import * as React from 'react'

import { TitleBar } from '~/components/ListDetail/TitleBar'
import { GlobalNavigationContext } from '~/components/Providers/GlobalNavigation'
import { GlobalSiteContext } from '~/components/Providers/GlobalSite'
import { useContextQuery } from '~/graphql/types.generated'

import { AppSidebarNavigation } from './AppNavigation'
import { EmptySidebarNavigation } from './EmptyNavigation'
import { SidebarOverlay } from './Overlay'
import { SiteSidebarNavigation } from './SiteNavigation'
import { UserFooter } from './UserFooter'

export function Sidebar() {
  const { data } = useContextQuery()

  const scrollContainerRef = React.useRef(null)

  return (
    <GlobalSiteContext.Consumer>
      {({ isAppDomain, unparkedSubdomain }) => {
        return (
          <GlobalNavigationContext.Consumer>
            {({ isOpen }) => (
              <>
                <nav
                  ref={scrollContainerRef}
                  className={`${
                    isOpen
                      ? 'absolute inset-y-0 left-0 translate-x-0 shadow-lg'
                      : 'absolute -translate-x-full'
                  } 3xl:w-80 z-30 flex h-full max-h-screen-safe min-h-screen-safe pb-safe w-3/4 flex-none transform flex-col overflow-y-auto border-r border-gray-150 bg-white transition duration-200 ease-in-out dark:border-gray-800 dark:bg-gray-900 sm:w-1/2 md:w-1/3 lg:relative lg:z-auto lg:w-56 lg:translate-x-0 lg:bg-gray-50 lg:dark:bg-gray-900 2xl:w-72`}
                >
                  <TitleBar
                    scrollContainerRef={scrollContainerRef}
                    leadingAccessory={null}
                    title={data?.context?.site?.name || 'Nym'}
                  />
                  {isAppDomain ? (
                    <AppSidebarNavigation />
                  ) : !unparkedSubdomain ? (
                    <SiteSidebarNavigation />
                  ) : (
                    <EmptySidebarNavigation />
                  )}
                  <UserFooter />
                </nav>

                <SidebarOverlay />
              </>
            )}
          </GlobalNavigationContext.Consumer>
        )
      }}
    </GlobalSiteContext.Consumer>
  )
}
