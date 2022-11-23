/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import { SiteRole } from '@prisma/client'
import * as React from 'react'

import {
  Label,
  Subsection,
  SubsectionSplitter,
} from '~/components/admin-components'
import { PrimaryButton } from '~/components/Button'
import { Input } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AdminProfilePage(props) {
  const { data } = useContextQuery()

  return (
    <Detail.Container>
      <TitleBar
        title="Domain Mappings"
        backButton
        globalMenu={false}
        backButtonHref={'/admin'}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title>Profile</Detail.Title>

        <Subsection title="Basic information">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-5">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                type="text"
                name="full-name"
                id="full-name"
                autoComplete="disabled"
              />
            </div>
          </div>
        </Subsection>

        <div className="py-5">
          <PrimaryButton type="submit">Save profile</PrimaryButton>
        </div>

        <SubsectionSplitter />
        <Subsection title="Change password">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-5 sm:col-span-4">
              <Label htmlFor="old-password">Old Password</Label>
              <Input
                type="password"
                name="old-password"
                id="old-password"
                autoComplete="disabled"
              />
            </div>
            <div className="col-span-5 sm:col-span-4">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                type="password"
                name="new-password"
                id="new-password"
                autoComplete="disabled"
              />
            </div>
            <div className="col-span-5 sm:col-span-4">
              <Label htmlFor="new-password1">Confirm Password</Label>
              <Input
                type="password"
                name="new-password1"
                id="new-password1"
                autoComplete="disabled"
              />
            </div>
          </div>
          <div className="py-3">
            <PrimaryButton type="submit">Change Password</PrimaryButton>
          </div>
        </Subsection>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

AdminProfilePage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }
  if (graphqlData[0]?.data?.context?.viewer?.isAdmin) {
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

export default AdminProfilePage
