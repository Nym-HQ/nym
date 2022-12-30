import { useRouter } from 'next/router'
import * as React from 'react'
import { X } from 'react-feather'
import toast from 'react-hot-toast'

import Button, { GhostButton, PrimaryButton } from '~/components/Button'
import { TextWithDatePicker } from '~/components/DatePicker'
import { Input, Textarea } from '~/components/Input'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { GET_PAGES } from '~/graphql/queries/pages'
import {
  useAddPageMutation,
  useEditPageMutation,
} from '~/graphql/types.generated'
import * as bee from '~/lib/bee'
import { slugifyString } from '~/lib/utils'

import { PageEditorContext } from './PageEditor'

export function PageEditorMetaSidebar({ site }) {
  const router = useRouter()
  const context = React.useContext(PageEditorContext)
  const {
    draftState,
    existingPage,
    setDraftState,
    sidebarIsOpen,
    setSidebarIsOpen,
  } = context
  const scrollContainerRef = React.useRef(null)

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

  function handleCreateDraft() {
    if (!existingPage?.id) {
      return addPage({
        variables: {
          data: {
            title: draftState.title,
            text: draftState.text,
            data: JSON.stringify(draftState.data),
            excerpt: draftState.excerpt,
            slug:
              slugifyString(draftState.slug) || slugifyString(draftState.title),
            path: draftState.path,
            featured: draftState.featured,
          },
        },
      })
    }
  }

  function handleUpdate(published?: boolean) {
    // if it's not published already, don't try to unpublish
    if (!existingPage.publishedAt && published === false) return

    let newlyPublished = false
    if (typeof published === 'undefined')
      // publish status unchanged
      published = !!existingPage.publishedAt
    else if (published === true) {
      // publish
      newlyPublished = true
    } else if (published === false) {
      // unpublish
    }

    return editPage({
      variables: {
        id: existingPage.id,
        data: {
          ...draftState,
          data: JSON.stringify(draftState.data),
          slug: slugifyString(draftState.slug),
          published,
        },
      },
      refetchQueries: [GET_PAGES],
    }).then((resp) => {
      if (newlyPublished) {
        bee.track('Page Published', {
          site_id: site?.id,
          subdomain: site?.subdomain,
          page_id: resp.data.editPage.id,
          page_slug: resp.data.editPage.slug,
        })
      }
    })
  }

  function handleSlugChange(e) {
    return setDraftState((draft) => ({
      ...draft,
      slug: slugifyString(e.target.value || '', false),
    }))
  }

  function handleExcerptChange(e) {
    return setDraftState((draft) => ({ ...draft, excerpt: e.target.value }))
  }

  return (
    <>
      <nav
        ref={scrollContainerRef}
        className={`${
          sidebarIsOpen
            ? 'absolute inset-y-0 right-0 translate-x-0 shadow-lg'
            : 'absolute right-0 translate-x-full hidden'
        } 3xl:w-80 z-30 flex h-full max-h-screen-safe min-h-screen-safe pb-safe w-3/4 flex-none transform flex-col overflow-y-auto border-l border-gray-150 bg-white pb-10 transition duration-200 ease-in-out dark:border-gray-800 dark:bg-gray-900 sm:w-1/2 md:w-1/3 lg:w-64 2xl:w-72`}
      >
        <TitleBar
          scrollContainerRef={scrollContainerRef}
          leadingAccessory={null}
          trailingAccessory={
            <GhostButton size="small-square" aria-label="Close details">
              <X size={16} onClick={() => setSidebarIsOpen(false)} />
            </GhostButton>
          }
          globalMenu={false}
          title="Details"
        />

        <div className="flex-1 space-y-4 px-3 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-primary text-sm font-semibold">Slug</p>
            <Input
              placeholder="Slug"
              value={draftState.slug}
              onChange={handleSlugChange}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <p className="text-primary text-sm font-semibold">Excerpt</p>
            <Textarea
              value={draftState.excerpt}
              placeholder="Excerpt"
              rows={8}
              maxRows={8}
              onChange={handleExcerptChange}
            />
          </div>

          {existingPage?.id && (
            <div className="flex flex-col space-y-1">
              <p className="text-primary text-sm font-semibold">Publish date</p>
              <TextWithDatePicker
                value={draftState.publishedAt}
                onChange={(v) =>
                  setDraftState({ ...draftState, publishedAt: v })
                }
              />
            </div>
          )}
        </div>

        <div className="filter-blur sticky bottom-0 z-10 flex flex-col items-center justify-between space-x-3 border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60">
          {existingPage?.id && (
            <PrimaryButton
              style={{ width: '100%', margin: '8px 0 0 0' }}
              disabled={editingPage}
              onClick={() => handleUpdate()}
            >
              {editingPage ? <LoadingSpinner /> : 'Save'}
            </PrimaryButton>
          )}
          {existingPage?.id && !existingPage?.publishedAt && (
            <PrimaryButton
              style={{ width: '100%', margin: '8px 0 0 0' }}
              disabled={editingPage}
              onClick={() => handleUpdate(true)}
            >
              {editingPage ? <LoadingSpinner /> : 'Publish'}
            </PrimaryButton>
          )}
          {existingPage?.id && existingPage?.publishedAt && (
            <Button
              style={{ width: '100%', margin: '8px 0 0 0' }}
              disabled={editingPage}
              onClick={() => handleUpdate(false)}
            >
              {editingPage ? <LoadingSpinner /> : 'Unpublish'}
            </Button>
          )}
          {!existingPage?.id && (
            <Button
              style={{ width: '100%', margin: '8px 0 0 0' }}
              disabled={creatingPage}
              onClick={handleCreateDraft}
            >
              {creatingPage ? <LoadingSpinner /> : <span>Save draft</span>}
            </Button>
          )}
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-5 transition duration-200 ease-in-out dark:bg-opacity-50 ${
          sidebarIsOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarIsOpen(false)}
      />
    </>
  )
}
