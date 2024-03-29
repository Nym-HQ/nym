import { useRouter } from 'next/router'
import * as React from 'react'
import { Sidebar } from 'react-feather'
import toast from 'react-hot-toast'

import Button from '~/components/Button'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Tooltip } from '~/components/Tooltip'
import {
  useAddPostMutation,
  useEditPostMutation,
} from '~/graphql/types.generated'
import { slugifyString } from '~/lib/utils'

import { PostEditorContext } from './PostEditor'

export function PostEditorActions() {
  const router = useRouter()
  const context = React.useContext(PostEditorContext)
  const {
    draftState,
    setDraftState,
    existingPost,
    sidebarIsOpen,
    setSidebarIsOpen,
    isPreviewing,
    setIsPreviewing,
    isDraftValid,
    draftErrors,
  } = context

  const [addPost, { loading: creatingPost }] = useAddPostMutation({
    onCompleted({ addPost }) {
      toast.success('Draft created')
      router.push({
        pathname: '/writing/[slug]/edit',
        query: { slug: addPost.slug },
      })
    },
  })

  const [editPost, { loading: editingPost }] = useEditPostMutation()

  function handleEditOrCreate() {
    if (existingPost?.id) {
      return editPost({
        variables: {
          id: existingPost.id,
          data: {
            ...draftState,
            data: JSON.stringify(draftState.data),
            slug: slugifyString(draftState.slug),
          },
        },
        onCompleted({ editPost }) {
          toast.success('Post updated')
        },
      })
    }

    return addPost({
      variables: {
        data: {
          title: draftState.title,
          text: draftState.text,
          data: JSON.stringify(draftState.data),
          excerpt: draftState.excerpt,
          slug:
            slugifyString(draftState.slug) || slugifyString(draftState.title),
        },
      },
      onCompleted({ addPost }) {
        toast.success('Draft created')
      },
    })
  }

  const isSavingDraft = editingPost || creatingPost

  return (
    <div className="flex items-center space-x-2">
      <Tooltip
        placement="bottom"
        content={
          isDraftValid
            ? existingPost?.publishedAt
              ? 'Update'
              : 'Save draft'
            : draftErrors[0].message
        }
      >
        {/* a small trick to show the tooltip even if the button is disabled by wrapping into <span/> */}
        <span>
          <Button
            disabled={isSavingDraft || !isDraftValid}
            onClick={handleEditOrCreate}
          >
            {isSavingDraft ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>
                  {existingPost?.publishedAt ? 'Update' : 'Save draft'}
                </span>
              </>
            )}
          </Button>
        </span>
      </Tooltip>
      <Button onClick={() => setSidebarIsOpen(!sidebarIsOpen)}>
        <Sidebar size={16} />
      </Button>
    </div>
  )
}
