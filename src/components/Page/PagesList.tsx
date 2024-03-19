import { useRouter } from 'next/router'
import * as React from 'react'

import { ListContainer } from '~/components/ListDetail/ListContainer'
import { useContextQuery, useGetPagesQuery } from '~/graphql/types.generated'

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
  const { data } = useContextQuery()

  const variables =
    filter === 'published'
      ? {
          filter: {
            published: true,
            featuredOnly: false,
            includeHomepage: data?.context?.viewer?.isAdmin,
          },
        }
      : {
          filter: {
            published: false,
            featuredOnly: false,
            includeHomepage: data?.context?.viewer?.isAdmin,
          },
        }

  const {
    data: pagesData,
    error,
    loading,
    refetch,
  } = useGetPagesQuery({ variables })

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

  const defaultContextValue = {
    filter,
    setFilter,
  }
}
