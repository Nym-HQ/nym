import * as React from 'react'

import { Comments } from '~/components/Comments'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { CommentType } from '~/graphql/types.generated'
import { timestampToCleanTime } from '~/lib/transformers'

import { EditorJSPreviewer } from '../EditorJS'
import { MDEditorPreviewer } from '../ReactMdEditor'
import { PostActions } from './PostActions'
import { PostSEO } from './PostSEO'

export function PostDetail({ slug, site, post, error, loading }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!post || error) {
    return <Detail.Null type="Post" />
  }

  const publishedAt = timestampToCleanTime({ timestamp: post.publishedAt })
  return (
    <>
      <PostSEO post={post} site={site} />
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

        <Detail.ContentContainer>
          <Detail.Header>
            <Detail.Title ref={titleRef}>{post.title}</Detail.Title>
            <span
              title={publishedAt.raw}
              className="text-tertiary inline-block leading-snug"
            >
              {publishedAt.formatted}
            </span>
          </Detail.Header>

          {post.text && !post.data?.blocks ? (
            <div className="mt-8">
              <MDEditorPreviewer source={post.text} />
            </div>
          ) : (
            <EditorJSPreviewer value={post.data} />
          )}
          {/* <MarkdownRenderer children={post.text} className="prose mt-8" /> */}

          {/* bottom padding to give space between post content and comments */}
          <div className="py-6" />
        </Detail.ContentContainer>

        <Comments refId={post.id} type={CommentType.Post} />
      </Detail.Container>
    </>
  )
}
