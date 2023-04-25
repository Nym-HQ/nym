/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import { LayoutGroup, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import * as React from 'react'
import ReactVisibilitySensor from 'react-visibility-sensor'

import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { ListContainer } from '~/components/ListDetail/ListContainer'
import { ListItem } from '~/components/ListDetail/ListItem'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { getContext } from '~/graphql/context'
import { GET_SITE_USERS } from '~/graphql/queries/site'
import {
  useContextQuery,
  useGetSiteUsersQuery,
  UserInfoFragment,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

interface MemberListItemProps {
  user: UserInfoFragment
  siteRole: string
}

export const MemberListItemItem = React.memo<MemberListItemProps>(
  ({ user, siteRole }) => {
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
          key={user.id}
          title={user.username}
          byline={<div className="flex items-center space-x-2">{siteRole}</div>}
          onClick={(e) => handleClick(e)}
          href={''}
          as={''}
          active={true}
        />
      </ReactVisibilitySensor>
    )
  }
)

function MemberList({ siteUsers }) {
  const router = useRouter()
  const [scrollContainerRef, setScrollContainerRef] = React.useState(null)

  // scroll to the top of the list whenever the filters are changed
  React.useEffect(() => {
    if (scrollContainerRef?.current) scrollContainerRef.current.scrollTo(0, 0)
  }, [])

  if (!siteUsers || siteUsers.length == 0) {
    return (
      <ListContainer onRef={setScrollContainerRef}>
        <div className="flex flex-1 items-center justify-center pt-3">
          <LoadingSpinner />
        </div>
      </ListContainer>
    )
  }

  return (
    <ListContainer data-cy="member-list" onRef={setScrollContainerRef}>
      <LayoutGroup>
        <div className="lg:space-y-1 lg:p-3">
          {siteUsers.map((su) => {
            return (
              <motion.div layout key={su.id}>
                <MemberListItemItem siteRole={su.siteRole} user={su.user} />
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </ListContainer>
  )
}

function AdminMembersPage(props) {
  const { data: context } = useContextQuery()
  const { data } = useGetSiteUsersQuery()

  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  return (
    <Detail.Container ref={scrollContainerRef}>
      <TitleBar
        title="Members"
        backButton
        globalMenu={false}
        backButtonHref={'/'}
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title ref={titleRef}>Members</Detail.Title>

        <div className="pt-3">
          <MemberList siteUsers={data.siteUsers} />
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_SITE_USERS }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  // require login
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/login',
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

AdminMembersPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export default AdminMembersPage
