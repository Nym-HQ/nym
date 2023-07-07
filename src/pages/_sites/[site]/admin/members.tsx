/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import { LayoutGroup, motion } from 'framer-motion'
import Link from 'next/link'
import { GetServerSideProps } from 'next/types'
import * as React from 'react'
import ReactVisibilitySensor from 'react-visibility-sensor'

import Button from '~/components/Button'
import { DeleteButton } from '~/components/Button'
import { DialogComponent } from '~/components/Dialog'
import { Select } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { ListContainer } from '~/components/ListDetail/ListContainer'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { getContext } from '~/graphql/context'
import { GET_SITE_USERS } from '~/graphql/queries/site'
import {
  SiteRole,
  SiteUser,
  useContextQuery,
  useEditSiteUserMutation,
  useGetSiteUsersQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { formatSiteRole } from '~/lib/formatters'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

interface MemberListItemProps {
  siteUser: SiteUser
  context: any
  onClick: () => void
}

export const MemberListItemItem = React.memo<MemberListItemProps>(
  ({ siteUser, context, onClick }) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const { user, siteRole } = siteUser

    return (
      <ReactVisibilitySensor
        partialVisibility
        onChange={(visible: boolean) => !isVisible && setIsVisible(visible)}
      >
        <Link
          href={`/u/${user.username}`}
          onClick={(e) => {
            e.preventDefault()
            context.viewer?.id != user.id && onClick()
          }}
          className="flex space-x-3 border-b border-gray-100 py-3 px-3.5 text-sm dark:border-gray-900 lg:rounded-lg lg:border-none lg:py-2 bg-black dark:bg-gray-700"
          passHref
        >
          <div className="w-full flex flex-row items-center justify-between space-y-1">
            <div>
              <img className="rounded-full mr-4 h-8" src={user.image} />
            </div>
            <div className="font-medium text-white">
              {user.name || user.username}
              {context.viewer?.id == user.id && (
                <span className="ml-2 text-sm">(You)</span>
              )}
            </div>
            <div className="flex-1"></div>
            <div className="text-white text-opacity-60">
              {formatSiteRole(siteRole)}
            </div>
          </div>
        </Link>
      </ReactVisibilitySensor>
    )
  }
)

function MemberList({ siteUsers, context }) {
  const [scrollContainerRef, setScrollContainerRef] = React.useState(null)
  const [isEditMemberDialogOpen, setEditMemberDialogOpen] =
    React.useState(false)
  const [editingSiteUser, setEditingSiteUser] = React.useState(null as SiteUser)
  const [editingSiteRole, setEditingSiteRole] = React.useState(
    SiteRole.User as SiteRole
  )
  const [members, setMembers] = React.useState(siteUsers)
  const [error, setError] = React.useState(null as string)

  // scroll to the top of the list whenever the filters are changed
  React.useEffect(() => {
    if (scrollContainerRef?.current) scrollContainerRef.current.scrollTo(0, 0)
  }, [])

  const listContainerClassNames =
    'relative w-full max-h-screen-safe min-h-[100px] pb-safe flex-none overflow-y-auto border-r border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-900 lg:bg-gray-50 lg:dark:bg-gray-900'

  if (!members || members.length == 0) {
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

  const openEditMemberDialog = (siteUser: SiteUser) => {
    setEditingSiteUser(siteUser)
    setEditingSiteRole(siteUser.siteRole)
    setEditMemberDialogOpen(true)
  }

  const [editSiteUser] = useEditSiteUserMutation({
    variables: {
      data: {
        userId: editingSiteUser?.user.id,
        siteRole: editingSiteRole,
      },
    },
    optimisticResponse: {
      __typename: 'Mutation',
      editSiteUser: {
        __typename: 'SiteUser',
        ...editingSiteUser,
        siteRole: editingSiteRole,
      },
    },
    onError({ message }) {
      setError(message.replace('GraphQL error:', ''))
    },
  })

  const handleEdit = async () => {
    const resp = await editSiteUser()
    if (resp?.data?.editSiteUser) {
      const editing = members.find((su) => su.id == editingSiteUser.id)
      const edited = {
        ...editing,
        siteRole: resp?.data?.editSiteUser?.siteRole,
      }
      const newMembers = [...members]
      newMembers.splice(members.indexOf(editing), 1, edited)
      setMembers(newMembers)
    }
    setEditMemberDialogOpen(false)
  }

  return (
    <ListContainer
      className={listContainerClassNames}
      data-cy="member-list"
      onRef={setScrollContainerRef}
    >
      <LayoutGroup>
        <div className="lg:space-y-1 lg:p-3">
          {members.map((su) => {
            return (
              <motion.div layout key={su.id}>
                <MemberListItemItem
                  siteUser={su}
                  context={context}
                  onClick={() => openEditMemberDialog(su)}
                />
              </motion.div>
            )
          })}
        </div>
        <DialogComponent
          isOpen={isEditMemberDialogOpen}
          title={'Assign Role'}
          onClose={() => setEditMemberDialogOpen(false)}
          modalContent={({ closeModal }) => (
            <div className="p-4 space-y-3">
              <div>
                <Select
                  value={editingSiteRole}
                  onChange={(e) => setEditingSiteRole(e.target.value)}
                >
                  <option value={SiteRole.Admin}>
                    {formatSiteRole(SiteRole.Admin)}
                  </option>
                  <option value={SiteRole.User}>
                    {formatSiteRole(SiteRole.User)}
                  </option>
                  <option value={SiteRole.PaidUser}>
                    {formatSiteRole(SiteRole.PaidUser)}
                  </option>
                </Select>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex justify-between pt-12">
                  <DeleteButton
                    onClick={() => {
                      closeModal()
                    }}
                  >
                    Delete
                  </DeleteButton>
                  <div className="flex space-x-3">
                    <Button onClick={handleEdit}>Save</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
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
          <MemberList siteUsers={data.siteUsers} context={context.context} />
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)

  // require login
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/login',
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

  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_SITE_USERS }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
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
