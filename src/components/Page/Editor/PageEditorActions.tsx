import { useRouter } from 'next/router'
import * as React from 'react'
import { Sidebar } from 'react-feather'
import toast from 'react-hot-toast'

import Button from '~/components/Button'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Switch } from '~/components/Switch'
import {
  useAddPageMutation,
  useEditPageMutation,
} from '~/graphql/types.generated'
import { slugifyString } from '~/lib/utils'

import { PageEditorContext } from './PageEditor'
import { PageEditorAutoSave } from './PageEditorAutoSave'

export function PageEditorActions() {
  const router = useRouter()
  const context = React.useContext(PageEditorContext)
  const {
    draftState,
    existingPage,
    sidebarIsOpen,
    setSidebarIsOpen,
    isPreviewing,
    setIsPreviewing,
    setDraftState,
  } = context

  const [addPage, { loading: creatingPage }] = useAddPageMutation({
    onCompleted({ addPage }) {
      toast.success('Draft created')
      router.push({
        pathname: '/pages/[slug]/edit',
        query: { slug: addPage.slug },
      })
    },
  })

  const [editPage, { loading: editingPage }] = useEditPageMutation()

  function handleEditOrCreate() {
    if (existingPage?.id) {
      return editPage({
        variables: {
          id: existingPage.id,
          data: {
            ...draftState,
            slug: slugifyString(draftState.slug),
          },
        },
      })
    }

    return addPage({
      variables: {
        data: {
          title: draftState.title,
          text: draftState.text,
          excerpt: draftState.excerpt,
          slug:
            slugifyString(draftState.slug) || slugifyString(draftState.title),
          path: draftState.path,
          featured: draftState.featured,
        },
      },
    })
  }

  const isSavingDraft = editingPage || creatingPage

  return (
    <div className="flex items-center space-x-2">
      <Switch
        label={'Home Page'}
        defaultEnabled={draftState.path === '/'}
        onChange={(val) =>
          setDraftState({ ...draftState, path: val ? '/' : null })
        }
      />
      <Switch
        label={'Featured'}
        defaultEnabled={draftState.featured}
        onChange={(val) => setDraftState({ ...draftState, featured: val })}
      />
      <Button disabled={isSavingDraft} onClick={handleEditOrCreate}>
        {isSavingDraft ? (
          <LoadingSpinner />
        ) : (
          <>
            <PageEditorAutoSave />{' '}
            <span>{existingPage?.publishedAt ? 'Update' : 'Save draft'}</span>
          </>
        )}
      </Button>
      <Button onClick={() => setSidebarIsOpen(!sidebarIsOpen)}>
        <Sidebar size={16} />
      </Button>
    </div>
  )
}
