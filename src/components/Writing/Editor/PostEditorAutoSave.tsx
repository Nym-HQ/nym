import * as React from 'react'

import { LoadingSpinner } from '~/components/LoadingSpinner'
import { useEditPostMutation } from '~/graphql/types.generated'
import useInterval from '~/hooks/useInterval'

import { PostEditorContext } from './PostEditor'

export function PostEditorAutoSave() {
  const context = React.useContext(PostEditorContext)
  const { draftState, existingPost } = context
  const { title, text, slug, excerpt } = draftState
  const [editPost, { loading }] = useEditPostMutation()

  // auto save every 30 seconds
  // only in draft mode
  useInterval(() => {
    if (!existingPost?.id || existingPost.publishedAt) return

    editPost({
      variables: {
        id: existingPost.id,
        data: { title, text, slug, excerpt },
      },
    })
  }, 30000)

  return <>{loading && <LoadingSpinner />}</>
}
