import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'
import { Link as LinkIcon } from 'react-feather'

import Button, { DeleteButton } from '~/components/Button'
import { Input, Textarea } from '~/components/Input'
import TagPicker from '~/components/Tag/TagPicker'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import { GET_BOOKMARK } from '~/graphql/queries/bookmarks'
import {
  useDeleteBookmarkMutation,
  useEditBookmarkMutation,
} from '~/graphql/types.generated'
import { defaultBookmarkTags } from '~/lib/consts'

export function EditBookmarkForm({ closeModal, bookmark }) {
  const router = useRouter()
  const initialState = {
    error: '',
    title: bookmark.title || bookmark.url,
    description: bookmark.description || '',
    tags: (bookmark.tags || []).map((t) => t.name) || ['reading'],
    faviconUrl: bookmark.faviconUrl,
  }

  function reducer(state, action) {
    switch (action.type) {
      case 'edit-title': {
        return {
          ...state,
          error: '',
          title: action.value,
        }
      }
      case 'edit-favicon': {
        return {
          ...state,
          error: '',
          faviconUrl: action.value,
        }
      }
      case 'edit-description': {
        return {
          ...state,
          error: '',
          description: action.value,
        }
      }
      case 'edit-tag': {
        return {
          ...state,
          error: '',
          tag:
            action.value && !Array.isArray(action.value)
              ? undefined
              : action.value,
          tags: action.value && Array.isArray(action.value) ? action.value : [],
        }
      }
      case 'error': {
        return {
          ...state,
          error: action.value,
        }
      }
      default:
        throw new Error()
    }
  }

  const [state, dispatch] = React.useReducer(reducer, initialState)

  const [editBookmark] = useEditBookmarkMutation({
    variables: {
      id: bookmark.id,
      data: {
        title: state.title,
        description: state.description,
        tags: state.tags,
        faviconUrl: state.faviconUrl,
      },
    },
    optimisticResponse: {
      __typename: 'Mutation',
      editBookmark: {
        __typename: 'Bookmark',
        ...bookmark,
        title: state.title,
        description: state.description,
        tags: (state.tags || []).map((t) => ({ __typename: 'Tag', name: t })),
        faviconUrl: state.faviconUrl,
      },
    },
    onError({ message }) {
      const value = message.replace('GraphQL error:', '')
      dispatch({ type: 'error', value })
    },
  })

  const [handleDelete] = useDeleteBookmarkMutation({
    variables: { id: bookmark.id },
    optimisticResponse: {
      __typename: 'Mutation',
      deleteBookmark: true,
    },
    update(cache) {
      const cacheData = cache.readQuery({
        query: GET_BOOKMARKS,
      }) as any

      cache.writeQuery({
        query: GET_BOOKMARK,
        variables: { id: bookmark.id },
        data: {
          bookmark: null,
        },
      })

      if (cacheData) {
        const { bookmarks } = cacheData
        cache.writeQuery({
          query: GET_BOOKMARKS,
          data: {
            bookmarks: {
              ...bookmarks,
              edges: bookmarks.edges.filter((o) => o.node.id !== bookmark.id),
            },
          },
        })
      }
    },
    onCompleted() {
      router.push('/bookmarks')
      closeModal()
    },
    onError() {
      dispatch({ type: 'error', value: 'Failed to delete the bookmark' })
    },
  })

  function handleSave(e) {
    e.preventDefault()

    if (!state.title || state.title.length === 0) {
      return dispatch({ type: 'error', value: 'Bookmark must have a title' })
    }

    editBookmark()
    return closeModal()
  }

  function onTitleChange(e) {
    return dispatch({ type: 'edit-title', value: e.target.value })
  }

  function onFaviconChange(e) {
    return dispatch({ type: 'edit-favicon', value: e.target.value })
  }

  function onKeyDown(e) {
    if (e.keyCode === 13 && e.metaKey) {
      return handleSave(e)
    }
  }

  function onDescriptionChange(e) {
    return dispatch({ type: 'edit-description', value: e.target.value })
  }

  function onTagChange(val) {
    dispatch({ type: 'edit-tag', value: val })
  }

  const tagFilter = (t) => {
    return defaultBookmarkTags.indexOf(t.name) >= 0
  }

  return (
    <div className="p-4">
      <form
        className="space-y-3 flex flex-col items-stretch"
        onSubmit={handleSave}
      >
        <Input
          placeholder="Title"
          defaultValue={state.title}
          onChange={onTitleChange}
          onKeyDown={onKeyDown}
        />
        {state.error && <p className="text-red-500">{state.error}</p>}
        <Link
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary flex items-center space-x-2 pb-2 text-sm opacity-70 hover:opacity-100"
          passHref
        >
          <LinkIcon className="flex-none" size={12} />
          <span className="line-clamp-1">{bookmark.url}</span>
        </Link>

        <TagPicker
          filter={tagFilter}
          defaultValue={initialState.tags}
          onChange={onTagChange}
          onError={(err) => err && dispatch({ type: 'error', value: err })}
        />

        <Textarea
          rows={4}
          defaultValue={bookmark.description}
          onChange={onDescriptionChange}
          onKeyDown={onKeyDown}
          placeholder={'Description...'}
        />

        <Input
          placeholder="Favicon URL"
          defaultValue={state.faviconUrl}
          onChange={onFaviconChange}
          onKeyDown={onKeyDown}
        />
      </form>
      <div className="flex justify-between pt-24">
        <DeleteButton
          onClick={() => {
            handleDelete()
          }}
        >
          Delete
        </DeleteButton>
        <div className="flex space-x-3">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  )
}
