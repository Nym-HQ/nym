import { useRouter } from 'next/router'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Label } from '~/components/admin-components'
import { PrimaryButton } from '~/components/Button'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { getContext } from '~/graphql/context'
import { useAddSiteMutation } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { TENANT_DOMAIN } from '~/lib/multitenancy/client'

function CreateYourWebsitePage() {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState('')

  const [addSite, { loading: creatingSite }] = useAddSiteMutation({
    onCompleted({ addSite }) {
      toast.success('Site created')
      router.push('/')
    },
  })

  const createSite = () => {
    return addSite({
      variables: {
        data: {
          subdomain,
        },
      },
    })
  }

  return (
    <Detail.Container data-cy="home-intro">
      <TitleBar magicTitle title="Create your website quick and easy" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <Detail.ContentContainer>
          <div className="pb-24 space-y-8 md:space-y-16">
            <h2 className="text-primary font-sans text-xl font-semibold">
              Let&rsquo;s get started
            </h2>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-4">
                <Label htmlFor="subdomain-name">Choose a subdomain</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="subdomain-name"
                    id="subdomain-name"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        (e.target.value || '').replaceAll(/[^\w]/g, '')
                      )
                    }
                    className="w-full rounded-l-md text-primary px-4 py-2 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 hover border-gray-200 dark:border-gray-700"
                    autoComplete="disabled"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-r-0 border-gray-300 px-3 text-sm text-gray-500 bg-gray-1000 dark:bg-white dark:bg-opacity-5 bg-opacity-5 border-gray-200 dark:border-gray-700">
                    .{TENANT_DOMAIN}
                  </span>
                </div>
              </div>
              <div className="col-span-6 text-right">
                <PrimaryButton onClick={createSite} disabled={creatingSite}>
                  {creatingSite && <LoadingSpinner />} Create Site &gt;&gt;
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Detail.ContentContainer>
      </div>

      <PoweredByNym />
    </Detail.Container>
  )
}

export default CreateYourWebsitePage

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)

  // if not signed in, redirect to sign in page
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/login?next=/create-site',
        permanent: false,
      },
    }
  }

  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}
