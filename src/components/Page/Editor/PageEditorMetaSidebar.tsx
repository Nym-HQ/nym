import { useRouter } from 'next/router'
import * as React from 'react'
import { X } from 'react-feather'
import toast from 'react-hot-toast'

import Button, { GhostButton, PrimaryButton } from '~/components/Button'
import { TextWithDatePicker } from '~/components/DatePicker'
import { Input, Select, Textarea } from '~/components/Input'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Tooltip } from '~/components/Tooltip'
import { GET_PAGES } from '~/graphql/queries/pages'
import {
  PageAccess,
  useAddPageMutation,
  useEditPageMutation,
} from '~/graphql/types.generated'
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
    isDraftValid,
    draftErrors,
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
      if (!draftState.publishedAt) {
        setDraftState({ ...draftState, publishedAt: new Date() })
      }
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
    })
  }

  function handleSlugChange(e) {
    return setDraftState((draft) => ({
      ...draft,
      slug: slugifyString(e.target.value || '', false),
    }))
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
              onChange={(e) =>
                setDraftState((draft) => ({
                  ...draft,
                  excerpt: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col space-y-1">
            <p className="text-primary text-sm font-semibold">Access</p>
            <Select
              value={draftState.access}
              onChange={(e) =>
                setDraftState((draft) => ({
                  ...draft,
                  access: e.target.value,
                }))
              }
            >
              <option value={PageAccess.Public}>Public</option>
              <option value={PageAccess.Members}>Members Only</option>
              <option value={PageAccess.PaidMembers}>Paid-members Only</option>
            </Select>
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

        <div className="filter-blur sticky bottom-0 z-10 flex flex-col items-center justify-between border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60">
          {existingPage?.id && (
            <Tooltip content={isDraftValid ? 'Save' : draftErrors[0].message}>
              <span className="w-full mt-2">
                <PrimaryButton
                  addclassname="w-full"
                  disabled={editingPage || !isDraftValid}
                  title={isDraftValid ? 'Save' : draftErrors[0].message}
                  onClick={() => handleUpdate()}
                >
                  {editingPage ? <LoadingSpinner /> : 'Save'}
                </PrimaryButton>
              </span>
            </Tooltip>
          )}
          {existingPage?.id && !existingPage?.publishedAt && (
            <Tooltip
              content={isDraftValid ? 'Publish' : draftErrors[0].message}
            >
              <span className="w-full mt-2">
                <PrimaryButton
                  addclassname="w-full"
                  disabled={editingPage || !isDraftValid}
                  onClick={() => handleUpdate(true)}
                >
                  {editingPage ? <LoadingSpinner /> : 'Publish'}
                </PrimaryButton>
              </span>
            </Tooltip>
          )}
          {existingPage?.id && existingPage?.publishedAt && (
            <Tooltip
              content={isDraftValid ? 'Unpublish' : draftErrors[0].message}
            >
              <span className="w-full mt-2">
                <Button
                  addclassname="w-full"
                  disabled={editingPage || !isDraftValid}
                  onClick={() => handleUpdate(false)}
                >
                  {editingPage ? <LoadingSpinner /> : 'Unpublish'}
                </Button>
              </span>
            </Tooltip>
          )}
          {!existingPage?.id && (
            <Tooltip
              content={isDraftValid ? 'Save draft' : draftErrors[0].message}
            >
              <span className="w-full mt-2">
                <Button
                  addclassname="w-full"
                  disabled={creatingPage || !isDraftValid}
                  onClick={handleCreateDraft}
                >
                  {creatingPage ? <LoadingSpinner /> : <span>Save draft</span>}
                </Button>
              </span>
            </Tooltip>
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
