/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */
import { LayoutGroup, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import * as React from 'react'
import toast from 'react-hot-toast'
import { BiInfoCircle } from 'react-icons/bi'
import ReactVisibilitySensor from 'react-visibility-sensor'

import {
  Label,
  Subsection,
  SubsectionSplitter,
} from '~/components/admin-components'
import Button, { DeleteButton, PrimaryButton } from '~/components/Button'
import { Dropzone } from '~/components/Dropzone'
import {
  ExternalLinkIcon,
  GitHubIcon,
  GlobeIcon,
  TwitterIcon,
  YouTubeIcon,
} from '~/components/Icon'
import { Input, Select, Textarea } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { ListContainer } from '~/components/ListDetail/ListContainer'
import { ListItem } from '~/components/ListDetail/ListItem'
import { ListLoadMore } from '~/components/ListDetail/ListLoadMore'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Tooltip } from '~/components/Tooltip'
import { getContext } from '~/graphql/context'
import {
  EmailSubscriptionListItemFragment,
  useContextQuery,
  useEditSiteMutation,
  useGetEmailSubscriptionsQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

export const NewsletterSubscribersContext = React.createContext({})

interface NewsletterSubscribersListItemProps {
  emailSubscription: EmailSubscriptionListItemFragment
  active: boolean
}

export const NewsletterSubscribersListItem =
  React.memo<NewsletterSubscribersListItemProps>(
    ({ emailSubscription, active }) => {
      const [isVisible, setIsVisible] = React.useState(false)

      function handleClick(e) {
        if (e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      return (
        <ReactVisibilitySensor
          partialVisibility
          onChange={(visible: boolean) => !isVisible && setIsVisible(visible)}
        >
          <ListItem
            key={emailSubscription.id}
            title={emailSubscription.email}
            byline={
              <div className="flex items-center space-x-2">
                {/* <span>{emailSubscription.email}</span> */}
              </div>
            }
            active={active}
            onClick={(e) => handleClick(e)}
            href={''}
            as={''}
          />
        </ReactVisibilitySensor>
      )
    }
  )

function NewsletterSubscribers(props) {
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
        <div className="flex flex-1 items-center justify-center">
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

function AdminNewslettersPage(props) {
  const { data: context } = useContextQuery()
  const [sending, setSending] = React.useState(false)

  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  const [template, setTemplate] = React.useState({
    subject: '',
    body: '',
  })

  const sendNewsletter = () => {
    // TODO: validate template
    // TODO: send out newsletter
  }

  return (
    <Detail.Container ref={scrollContainerRef}>
      <TitleBar
        title="Publish Newsletter"
        backButton
        globalMenu={false}
        backButtonHref={'/admin'}
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title ref={titleRef}>Publish Newsletter</Detail.Title>

        <Subsection title="Write and Publish a Newsletter">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <Label htmlFor="template-body">
                Email body
                <Tooltip content="Use this with caution!">
                  <span className="relative ml-1 inline-block">
                    <BiInfoCircle />
                  </span>
                </Tooltip>
              </Label>
              <Textarea
                id="template-body"
                name="template-body"
                rows={4}
                value={template.body || ''}
                onChange={(e) =>
                  setTemplate({ ...template, body: e.target.value })
                }
              />
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6">
            <PrimaryButton
              type="submit"
              onClick={sendNewsletter}
              disabled={sending}
            >
              {sending && <LoadingSpinner />} Send Newsletter
            </PrimaryButton>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <Subsection title="Subscribers">
          <NewsletterSubscribers />
        </Subsection>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  // require login
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    }
  }

  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  // require to be admin
  if (!context.viewer.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

AdminNewslettersPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export default AdminNewslettersPage
