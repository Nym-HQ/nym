/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import { NextSeo } from 'next-seo'
import * as React from 'react'
import toast from 'react-hot-toast'

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
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import {
  useContextQuery,
  useEditSiteDomainMutation,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { TENANT_DOMAIN } from '~/lib/multitenancy/client'

function AdminDomainMappingPage(props) {
  const { data: context } = useContextQuery()

  const [parkedDomain, setParkedDomain] = React.useState(
    context?.context?.site?.parkedDomain || ''
  )

  const [editSiteDomain, { loading: saving }] = useEditSiteDomainMutation({
    onCompleted({ editSiteDomain }) {
      toast.success('Saved domain mapping information!')
    },
  })

  const saveDomainMapping = () => {
    return editSiteDomain({
      variables: {
        subdomain: context?.context?.site?.subdomain,
        data: {
          parkedDomain,
        },
      },
    })
  }

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
        <Detail.Title>Domain Mapping</Detail.Title>

        <Subsection title="">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-4">
              <Label htmlFor="subdomain-name">Nymhq Subdomain name</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="subdomain-name"
                  id="subdomain-name"
                  className="w-full rounded-l-md text-primary px-4 py-2 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 hover border-gray-200 dark:border-gray-700"
                  defaultValue={props.site.subdomain}
                  autoComplete="disabled"
                  readOnly={true}
                />
                <span className="inline-flex items-center rounded-r-md border border-r-0 border-gray-300 px-3 text-sm text-gray-500 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 border-gray-200 dark:border-gray-700">
                  .{TENANT_DOMAIN}
                </span>
              </div>
            </div>
            <div className="col-span-6 sm:col-span-4">
              <Label htmlFor="ip-mapping">IP Mapping</Label>
              <Input
                type="text"
                name="ip-mapping"
                id="ip-mapping"
                defaultValue="76.76.21.21"
                autoComplete="disabled"
                readOnly={true}
              />
            </div>
            <div className="col-span-6 sm:col-span-4">
              <Label htmlFor="parked-domain-name">Domain name</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-sm text-gray-500 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 border-gray-200 dark:border-gray-700">
                  https://
                </span>
                <input
                  type="text"
                  name="parked-domain-name"
                  id="parked-domain-name"
                  value={parkedDomain}
                  onChange={(e) => setParkedDomain(e.target.value)}
                  className="w-full rounded-r-md text-primary px-4 py-2 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 hover border-gray-200 dark:border-gray-700"
                  placeholder="www.example.com"
                  autoComplete="disabled"
                />
              </div>
            </div>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <div className="py-3">
          <PrimaryButton
            type="submit"
            onClick={saveDomainMapping}
            disabled={saving}
          >
            {saving && <LoadingSpinner />}Save domain mapping
          </PrimaryButton>
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

AdminDomainMappingPage.getLayout = function getLayout(page) {
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

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

export default AdminDomainMappingPage
