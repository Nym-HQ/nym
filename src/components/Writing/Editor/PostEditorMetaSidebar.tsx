import { useRouter } from 'next/router'
import * as React from 'react'
import { X } from 'react-feather'
import toast from 'react-hot-toast'

import Button, { GhostButton, PrimaryButton } from '~/components/Button'
import { TextWithDatePicker } from '~/components/DatePicker'
import { Input, Textarea } from '~/components/Input'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Tooltip } from '~/components/Tooltip'
import { GET_POSTS } from '~/graphql/queries/posts'
import {
  useAddPostMutation,
  useEditPostMutation,
} from '~/graphql/types.generated'
// import * as bee from '~/lib/bee'
import { slugifyString } from '~/lib/utils'

import { PostEditorContext } from './PostEditor'

export function PostEditorMetaSidebar({ site }) {
  const router = useRouter()
  const context = React.useContext(PostEditorContext)
  const {
    draftState,
    existingPost,
    setDraftState,
    sidebarIsOpen,
    setSidebarIsOpen,
    publishNewsletter,
    setPublishNewsletter,
    isDraftValid,
    draftErrors,
  } = context
  const scrollContainerRef = React.useRef(null)

  const [addPost, { loading: creatingPost }] = useAddPostMutation({
    onCompleted({ addPost }) {
      toast.success('Draft created')
      router.push({
        pathname: '/posts/[slug]/edit',
        query: { slug: addPost.slug },
      })
    },
  })
  const [editPost, { loading: editingPost }] = useEditPostMutation()

  function handleCreateDraft() {
    if (!existingPost?.id) {
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
      })
    }
  }

  function handleUpdate(published?: boolean) {
    // if it's not published already, don't try to unpublish
    if (!existingPost.publishedAt && published === false) return

    let newlyPublished = false
    if (typeof published === 'undefined')
      // publish status unchanged
      published = !!existingPost.publishedAt
    else if (published === true) {
      // publish
      newlyPublished = true
      if (!draftState.publishedAt) {
        setDraftState({ ...draftState, publishedAt: new Date() })
      }
    } else if (published === false) {
      // unpublish
    }

    return editPost({
      variables: {
        id: existingPost.id,
        data: {
          ...draftState,
          data: JSON.stringify(draftState.data),
          slug: slugifyString(draftState.slug),
          published,
          publishNewsletter,
        },
      },
      refetchQueries: [GET_POSTS],
    }).then((resp) => {
      if (newlyPublished) {
        // bee.track('Post Published', {
        //   site_id: site?.id,
        //   subdomain: site?.subdomain,
        //   post_id: resp.data.editPost.id,
        //   post_slug: resp.data.editPost.slug,
        // })
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

          {existingPost?.id && (
            <div className="flex flex-col space-y-1">
              <p className="text-primary text-sm font-semibold">Publish Date</p>
              <TextWithDatePicker
                value={draftState.publishedAt}
                onChange={(v) =>
                  setDraftState({ ...draftState, publishedAt: v })
                }
              />
              <label className="flex items-start space-x-3 py-1">
                <input
                  type="checkbox"
                  disabled={!!existingPost.newsletterAt}
                  onChange={(e) => setPublishNewsletter(e.target.checked)}
                  defaultChecked={
                    existingPost.newsletterAt ? false : publishNewsletter
                  }
                  className="relative top-1 h-4 w-4 rounded border border-gray-300 dark:border-gray-700"
                />
                <span
                  className={`pt-1 text-sm font-semibold ${
                    existingPost.newsletterAt
                      ? 'line-through text-gray-400'
                      : 'text-primary'
                  }`}
                >
                  Publish to newsletter
                </span>
              </label>
              {existingPost.newsletterAt && (
                <p className="text-primary text-xs">
                  Newsletter was published at:{' '}
                  {new Date(existingPost.newsletterAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col filter-blur sticky bottom-0 z-10 flex items-center justify-between border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60">
          {existingPost?.id && (
            <Tooltip content={isDraftValid ? 'Save' : draftErrors[0].message}>
              <span className="w-full mt-1">
                <PrimaryButton
                  addclassname="w-full"
                  disabled={editingPost || !isDraftValid}
                  onClick={() => handleUpdate()}
                >
                  {editingPost ? <LoadingSpinner /> : 'Save'}
                </PrimaryButton>
              </span>
            </Tooltip>
          )}
          {existingPost?.id && !existingPost?.publishedAt && (
            <Tooltip
              content={isDraftValid ? 'Publish' : draftErrors[0].message}
            >
              <span className="w-full mt-1">
                <PrimaryButton
                  addclassname="w-full"
                  disabled={editingPost || !isDraftValid}
                  onClick={() => handleUpdate(true)}
                >
                  {editingPost ? <LoadingSpinner /> : 'Publish'}
                </PrimaryButton>
              </span>
            </Tooltip>
          )}
          {existingPost?.id && existingPost?.publishedAt && (
            <Tooltip
              content={isDraftValid ? 'Unpublish' : draftErrors[0].message}
            >
              <span className="w-full mt-1">
                <Button
                  addclassname="w-full"
                  disabled={editingPost || !isDraftValid}
                  onClick={() => handleUpdate(false)}
                >
                  {editingPost ? <LoadingSpinner /> : 'Unpublish'}
                </Button>
              </span>
            </Tooltip>
          )}
          {!existingPost?.id && (
            <Tooltip
              content={isDraftValid ? 'Save draft' : draftErrors[0].message}
            >
              <span className="w-full mt-1">
                <Button
                  addclassname="w-full"
                  disabled={creatingPost || !isDraftValid}
                  onClick={handleCreateDraft}
                >
                  {creatingPost ? <LoadingSpinner /> : <span>Save draft</span>}
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
