import Link from 'next/link'
import { NextSeo } from 'next-seo'
import * as React from 'react'
import { Link as LinkIcon } from 'react-feather'

import { PrimaryButton } from '~/components/Button'
import { Comments } from '~/components/Comments'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { Tags } from '~/components/Tag'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { CommentType } from '~/graphql/types.generated'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { BookmarkActions } from './BookmarkActions'
import { RelatedBookmarks } from './RelatedBookmarks'

export function BookmarkDetail({ id, bookmark, site, loading, error }) {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = React.useRef(null)
  const titleRef: React.RefObject<HTMLHeadingElement> = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!bookmark || error) {
    return <Detail.Null type="404" />
  }

  const seo = extendSEO(
    {
      ...routes.bookmarks.seo,
      title: `Bookmark:${bookmark.title}`,
      description: bookmark.description,
    },
    site
  )

  return (
    <>
      <NextSeo {...seo} />
      <Detail.Container data-cy="bookmark-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/bookmarks'}
          magicTitle
          title={bookmark.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={<BookmarkActions bookmark={bookmark} />}
        />

        <div className="flex flex-1 flex-col flex-start justify-start">
          <Detail.ContentContainer>
            <Detail.Header>
              <Tags tags={bookmark.tags} />
              <Link href={bookmark.url}>
                <a target="_blank" rel="noopener" className="block">
                  <Detail.Title ref={titleRef}>{bookmark.title}</Detail.Title>
                </a>
              </Link>
              <Link href={bookmark.url}>
                <a
                  target="_blank"
                  rel="noopener"
                  className="text-tertiary flex items-center space-x-2 leading-snug"
                >
                  {bookmark.faviconUrl && (
                    <img
                      src={bookmark.faviconUrl}
                      alt={`Favicon for ${bookmark.host}`}
                      className="h-4 w-4"
                      width="16px"
                      height="16px"
                    />
                  )}
                  <span>{bookmark.host}</span>
                </a>
              </Link>
              {bookmark.description && (
                <MarkdownRenderer
                  className="prose italic opacity-70"
                  children={bookmark.description}
                  variant="comment"
                />
              )}
            </Detail.Header>
            <div className="mt-6">
              <PrimaryButton
                size="large"
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon size={14} />
                <span>Visit</span>
              </PrimaryButton>
            </div>
          </Detail.ContentContainer>

          <RelatedBookmarks bookmark={bookmark} />
        </div>

        <Comments refId={bookmark.id} type={CommentType.Bookmark} />
      </Detail.Container>
    </>
  )
}
