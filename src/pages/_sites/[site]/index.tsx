import { NextPageContext } from 'next'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { EditorJSPreviewer } from '~/components/EditorJS'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { MDEditorPreviewer } from '~/components/ReactMdEditor'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_HOME_PAGE } from '~/graphql/queries/pages'
import { useContextQuery, useGetHomePageQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { parsePageData } from '~/lib/compat/data'

export default function Home(props) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const { data } = useGetHomePageQuery()

  const homepage = parsePageData(data?.homepage)

  const seo = extendSEO(routes.home.seo, context.context.site)
  return (
    <>
      <NextSeo {...seo} />
      {data?.homepage ? (
        <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
          <TitleBar
            magicTitle
            titleRef={titleRef}
            scrollContainerRef={scrollContainerRef}
            title="Home"
          />

          <div className="flex flex-1 flex-col flex-start justify-start">
            <Detail.ContentContainer>
              <div>
                {data.homepage.publishedAt && (
                  <span
                    title={data.homepage.publishedAt.raw}
                    className="text-tertiary inline-block leading-snug"
                  >
                    {data.homepage.publishedAt.formatted}
                  </span>
                )}

                {homepage.text && !homepage.data?.blocks ? (
                  <div className="mt-8">
                    <MDEditorPreviewer source={homepage.text} />
                  </div>
                ) : (
                  <EditorJSPreviewer value={homepage.data} />
                )}
                {/* <MarkdownRenderer children={homepage.text} className="prose" /> */}
              </div>
            </Detail.ContentContainer>
          </div>

          <PoweredByNym scrollContainerRef={scrollContainerRef} />
        </Detail.Container>
      ) : (
        <Detail.Null type="Page" />
      )}
    </>
  )
}

export async function getServerSideProps(ctx: NextPageContext) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))

  let commonProps = await getCommonPageProps(ctx, graphqlData[0])
  graphqlData.push(await apolloClient.query({ query: GET_HOME_PAGE }))

  if (!commonProps.site.siteId) {
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
