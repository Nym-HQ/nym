import { useRouter } from 'next/router'
import * as React from 'react'

import { ListContainer } from '~/components/ListDetail/ListContainer'
import { useGetPagesQuery, useViewerQuery } from '~/graphql/types.generated'

import { LoadingSpinner } from '../LoadingSpinner'
import { PageListItem } from './PageListItem'
import { PageTitlebar } from './PageTitlebar'

export const PageContext = React.createContext({
  filter: 'published',
  setFilter: (filter: string) => {},
})

export function PagesList() {
  const router = useRouter()
  const [filter, setFilter] = React.useState('published')
  let [scrollContainerRef, setScrollContainerRef] = React.useState(null)
  const { data: viewerData } = useViewerQuery()

  const variables =
    filter === 'published'
      ? {
          filter: {
            published: true,
            featuredOnly: false,
            includeHomepage: viewerData?.viewer?.isViewerSiteAdmin,
          },
        }
      : {
          filter: {
            published: false,
            featuredOnly: false,
            includeHomepage: viewerData?.viewer?.isViewerSiteAdmin,
          },
        }

  const { data, error, loading, refetch } = useGetPagesQuery({ variables })

  React.useEffect(() => {
    refetch()
  }, [filter])

  if (error) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <div />
      </ListContainer>
    )
  }

  if (loading && !data?.pages) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <PageTitlebar scrollContainerRef={scrollContainerRef} />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  const { pages } = data

  const defaultContextValue = {
    filter,
    setFilter,
  }

  return (
    <PageContext.Provider value={defaultContextValue}>
      <ListContainer data-cy="pages-list" onRef={setScrollContainerRef}>
        <PageTitlebar scrollContainerRef={scrollContainerRef} />

        <div className="lg:space-y-1 lg:p-3">
          {pages.map((page) => {
            const active = router.query?.slug === page.slug

            return <PageListItem key={page.id} page={page} active={active} />
          })}
        </div>
      </ListContainer>
    </PageContext.Provider>
  )
}
