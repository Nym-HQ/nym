import * as React from 'react'

import { LoadingSpinner } from '~/components/LoadingSpinner'
import { useEditPageMutation } from '~/graphql/types.generated'
import useInterval from '~/hooks/useInterval'

import { PageEditorContext } from './PageEditor'

export function PageEditorAutoSave() {
  const context = React.useContext(PageEditorContext)
  const { draftState, existingPage } = context
  const { title, text, path, slug, excerpt } = draftState
  const [editPage, { loading }] = useEditPageMutation()

  // auto save every 30 seconds
  // only in draft mode
  useInterval(() => {
    if (!existingPage?.id || existingPage.publishedAt) return

    editPage({
      variables: {
        id: existingPage.id,
        data: { title, text, path, slug, excerpt },
      },
    })
  }, 30000)

  return <>{loading && <LoadingSpinner />}</>
}
