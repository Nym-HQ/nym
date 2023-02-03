/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import * as React from 'react'
import { BiInfoCircle } from 'react-icons/bi'

import {
  Label,
  Subsection,
  SubsectionSplitter,
} from '~/components/admin-components'
import { PrimaryButton } from '~/components/Button'
import { Textarea } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import NewsletterSubscribers from '~/components/Newsletters/NewsletterSubscribers'
import { Tooltip } from '~/components/Tooltip'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

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
