import { useRouter } from 'next/router'
import * as React from 'react'
import toast from 'react-hot-toast'

import Button from '~/components/Button'
import { Input } from '~/components/Input'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import TagPicker from '~/components/Tag/TagPicker'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import {
  useAddBookmarkMutation,
  useContextQuery,
  useGetBookmarksQuery,
} from '~/graphql/types.generated'
// import { track } from '~/lib/bee'

export function AddBookmarkForm({ initUrl, closeModal }) {
  const { data: context } = useContextQuery()
  const [url, setUrl] = React.useState('')
  const [tags, setTags] = React.useState(['reading'])
  const router = useRouter()

  const [addBookmarkMutate, { loading }] = useAddBookmarkMutation()

  React.useEffect(() => {
    if (initUrl) setUrl(initUrl)
  }, [initUrl])

  // fetch all bookmarks in the background so that we can update the cache
  // immediately when the bookmark is saved
  const _ = useGetBookmarksQuery()

  function onSubmit(e) {
    e.preventDefault()

    addBookmarkMutate({
      variables: { data: { url, tags } },
      update(cache, { data }) {
        const { addBookmark } = data ? data : { addBookmark: null }
        if (addBookmark) {
          const { bookmarks } = cache.readQuery({ query: GET_BOOKMARKS }) as any
          return cache.writeQuery({
            query: GET_BOOKMARKS,
            data: {
              bookmarks: {
                ...bookmarks,
                edges: [
                  {
                    __typename: 'BookmarkEdge',
                    cursor: addBookmark.id,
                    node: addBookmark,
                  },
                  ...bookmarks.edges,
                ],
              },
            },
          })
        }
      },
      onError() {},
    }).then(({ data }) => {
      const { addBookmark } = data ? data : { addBookmark: null }
      if (!addBookmark) {
        // an error message must be shown by the Apollo client error handler already
        return
      }
      const { id } = addBookmark
      // track('Bookmark Added', {
      //   site_id: context?.context?.site?.id,
      //   subdomain: context?.context?.site?.subdomain,
      //   bookmark_id: id,
      //   url: url,
      // })

      closeModal()

      // if I'm already viewing bookmarks, push me to the one I just created.
      // otherwise, this was triggered from the sidebar shortcut and
      // don't redirect
      if (router.asPath.indexOf('/bookmarks') >= 0) {
        return router.push(`/bookmarks/${id}`)
      } else {
        toast.success('Bookmark created')
      }
    })
  }

  function onUrlChange(e) {
    return setUrl(e.target.value)
  }

  function onKeyDown(e) {
    if (e.keyCode === 13 && e.metaKey) {
      return onSubmit(e)
    }
  }

  return (
    <form className="space-y-3 p-4" onSubmit={onSubmit}>
      <Input
        type="text"
        placeholder="Add a url..."
        value={url}
        onChange={onUrlChange}
        onKeyDown={onKeyDown}
      />

      <TagPicker defaultValue={tags} onChange={setTags} />

      <div className="flex justify-end pt-2">
        <Button disabled={!url || loading} onClick={onSubmit}>
          {loading ? <LoadingSpinner /> : 'Save'}
        </Button>
      </div>
    </form>
  )
}
