import Link from 'next/link'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { Avatar } from '~/components/Avatar'
import { Comments } from '~/components/Comments'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { CommentType } from '~/graphql/types.generated'
import { timestampToCleanTime } from '~/lib/transformers'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { QuestionActions } from './QuestionActions'

export function QuestionDetail({ id, question, site, loading, error }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!question || error) {
    return <Detail.Null type="404" />
  }

  const createdAt = timestampToCleanTime({
    month: 'short',
    timestamp: question.createdAt,
  })

  const seo = extendSEO(
    {
      ...routes.ama.seo,
      title: `Q:${question.title}`,
      description: question.description,
    },
    site
  )

  return (
    <>
      <NextSeo {...seo} />
      <Detail.Container data-cy="question-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/qa'}
          magicTitle
          title={question.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={<QuestionActions question={question} />}
        />

        <Detail.ContentContainer>
          <Detail.Header>
            <div className="flex items-center space-x-4 pb-2">
              <Link href={`/u/${question.author.username}`}>
                <a className="inline-flex">
                  <Avatar
                    user={question.author}
                    src={question.author.avatar}
                    width={32}
                    height={32}
                    quality={100}
                    layout="fixed"
                    className="rounded-full"
                  />
                </a>
              </Link>
              <div className="flex space-x-1">
                <Link href={`/u/${question.author.username}`}>
                  <a className="inline-flex space-x-1">
                    <span className="text-primary whitespace-nowrap font-semibold leading-snug">
                      {question.author.name}
                    </span>
                    <span className="text-tertiary inline-flex font-normal leading-snug line-clamp-1">
                      @{question.author.username}
                    </span>
                  </a>
                </Link>
                <p className="text-quaternary leading-snug">·</p>
                <p
                  className="text-quaternary leading-snug line-clamp-1"
                  title={createdAt.raw}
                >
                  {createdAt.formatted}
                </p>
              </div>
            </div>
            <Detail.Title ref={titleRef}>{question.title}</Detail.Title>
            {question.description && (
              <MarkdownRenderer
                children={question.description}
                className="comment prose leading-normal"
                variant="comment"
              />
            )}
          </Detail.Header>
        </Detail.ContentContainer>

        {question.viewerCanComment && (
          <Comments refId={question.id} type={CommentType.Question} />
        )}
      </Detail.Container>
    </>
  )
}
