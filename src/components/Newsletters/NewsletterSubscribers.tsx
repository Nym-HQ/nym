import { LayoutGroup, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import * as React from 'react'

import { ListContainer } from '~/components/ListDetail/ListContainer'
import { ListLoadMore } from '~/components/ListDetail/ListLoadMore'
import { useGetEmailSubscriptionsQuery } from '~/graphql/types.generated'

import { LoadingSpinner } from '../LoadingSpinner'
import { NewsletterSubscribersListItem } from './NewsletterSubscribersItem'

export const NewsletterSubscribersContext = React.createContext({})

export default function NewsletterSubscribers(props) {
  const router = useRouter()
  const [isVisible, setIsVisible] = React.useState(false)
  const [scrollContainerRef, setScrollContainerRef] = React.useState(null)

  const variables = {}
  const defaultContextValue = {}

  const { data, error, loading, fetchMore } = useGetEmailSubscriptionsQuery({
    variables,
  })

  function handleFetchMore() {
    return fetchMore({
      variables: {
        ...variables,
        after: data.emailSubscriptions.pageInfo.endCursor,
      },
    })
  }

  // scroll to the top of the list whenever the filters are changed
  React.useEffect(() => {
    if (scrollContainerRef?.current) scrollContainerRef.current.scrollTo(0, 0)
  }, [])

  React.useEffect(() => {
    if (isVisible) handleFetchMore()
  }, [isVisible])

  const listContainerClassNames =
    'relative w-full max-h-screen-safe min-h-[100px] pb-safe flex-none overflow-y-auto border-r border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-900 lg:bg-gray-50 lg:dark:bg-gray-900'

  if (loading && !data?.emailSubscriptions) {
    return (
      <ListContainer
        onRef={setScrollContainerRef}
        className={listContainerClassNames}
      >
        <div className="flex flex-1 items-center justify-center pt-3">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  if (error) return null

  const { emailSubscriptions } = data

  return (
    <NewsletterSubscribersContext.Provider value={defaultContextValue}>
      <ListContainer
        data-cy="subscriber-list"
        onRef={setScrollContainerRef}
        className={listContainerClassNames}
      >
        <LayoutGroup>
          <div className="lg:space-y-1 lg:p-3">
            {emailSubscriptions.edges.map((es) => {
              const active = router.query.id === es.node.id
              return (
                <motion.div layout key={es.node.id}>
                  <NewsletterSubscribersListItem
                    active={active}
                    emailSubscription={es.node}
                  />
                </motion.div>
              )
            })}
          </div>

          {emailSubscriptions.pageInfo.hasNextPage && (
            <ListLoadMore setIsVisible={setIsVisible} />
          )}
        </LayoutGroup>
      </ListContainer>
    </NewsletterSubscribersContext.Provider>
  )
}
