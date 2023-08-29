import * as React from 'react'

import { Comments } from '~/components/Comments'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { CommentType } from '~/graphql/types.generated'
import { timestampToCleanTime } from '~/lib/transformers'

import { EditorJSEditor } from '../EditorJS'
import { Paywall } from '../ListDetail/Paywall'
import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { PostActions } from './PostActions'
import { PostSEO } from './PostSEO'

export function PostDetail({ slug, site, post, error, loading }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const editorJsRef = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!post || error) {
    return <Detail.Null type="Post" />
  }

  const publishedAt = timestampToCleanTime({ timestamp: post.publishedAt })
  return (
    <>
      {post && <PostSEO post={post} site={site} />}
      <Detail.Container data-cy="post-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/writing'}
          magicTitle
          title={post.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={<PostActions post={post} />}
        />

        <div className="flex flex-1 flex-col flex-start justify-start">
          <Detail.ContentContainer>
            <Detail.Header
              style={{
                maxWidth: '650px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <Detail.Title ref={titleRef}>{post.title}</Detail.Title>
              {publishedAt && (
                <span
                  title={publishedAt.raw}
                  className="text-tertiary inline-block leading-snug"
                >
                  {publishedAt.formatted}
                </span>
              )}
            </Detail.Header>

            {post.text && !post.data?.blocks?.length ? (
              <MarkdownRenderer children={post.text} className="prose mt-8" />
            ) : (
              <EditorJSEditor
                site={site}
                readOnly={true}
                value={post.data}
                editorRef={(el) => {
                  editorJsRef.current = el
                }}
              />
            )}

            {/* bottom padding to give space between post content and comments */}
            <div className="py-6" />
          </Detail.ContentContainer>

          {post._isMasked ? (
            <Paywall obj="Post" access={post.access} />
          ) : (
            <Comments refId={post.id} type={CommentType.Post} />
          )}
        </div>

        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
    </>
  )
}
