import { GetServerSideProps } from 'next/types'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { EditorJSEditor } from '~/components/EditorJS'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { ProfileImage } from '~/components/ProfileImage'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_HOME_PAGE } from '~/graphql/queries/pages'
import { useContextQuery, useGetHomePageQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { parsePageData } from '~/lib/compat/data'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

export default function Home(props) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const { data } = useGetHomePageQuery()

  const homepage = parsePageData(data?.homepage)

  const seo = extendSEO(context.context.site)
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
            {/* Wider container than the default 768px reading column so the
                homepage hero can span like cef.im (big photo, roomy heading),
                with generous side padding so it breathes from the nav and edge. */}
            <div className="mx-auto w-full max-w-5xl px-6 py-8 pb-10 md:px-10 lg:px-16">
              {/* cef.im-style hero. Responsive: on narrow screens the photo sits
                  large on top of the bio; on wider screens it moves alongside the
                  text on the right, top-aligned. The photo is first in the DOM so
                  it stacks on top when the row collapses to a column.
                  Homepage-only — pages/posts don't render the photo. */}
              <div className="home-hero flex flex-col gap-8 sm:flex-row-reverse sm:items-start sm:gap-10">
                {/* sm:mt-6 aligns the photo's top with the heading's first line
                    (the heading box sits ~24px below the flex top). */}
                <ProfileImage className="w-64 self-center sm:mt-6 sm:w-2/5 sm:max-w-[420px] sm:shrink-0 sm:self-start" />

                <div className="min-w-0 flex-1">
                  {data.homepage.publishedAt && (
                    <span
                      title={data.homepage.publishedAt.raw}
                      className="text-tertiary inline-block leading-snug"
                    >
                      {data.homepage.publishedAt.formatted}
                    </span>
                  )}

                  {homepage.text && !homepage.data?.blocks ? (
                    <MarkdownRenderer
                      children={homepage.text}
                      className="prose mt-8"
                    />
                  ) : (
                    <EditorJSEditor
                      readOnly={true}
                      site={null}
                      value={homepage.data}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <PoweredByNym scrollContainerRef={scrollContainerRef} />
        </Detail.Container>
      ) : (
        <Detail.Null type="Page" />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))

  let commonProps = await getCommonPageProps(ctx, graphqlData[0])
  graphqlData.push(await apolloClient.query({ query: GET_HOME_PAGE }))

  // Extract the site data from the GraphQL response
  const siteData = graphqlData[0]?.data?.context?.site

  if (!commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  // Check if the site is a community site using the GraphQL data
  if (siteData?.community_site) {
    return {
      redirect: {
        destination: '/bookmarks',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
      community_site: siteData?.community_site || false, // Pass this to the component
    },
  })
}
