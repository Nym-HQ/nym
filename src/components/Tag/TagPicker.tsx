import { Listbox } from '@headlessui/react'
import * as React from 'react'
import { Check, ChevronDown } from 'react-feather'

import { useGetTagsQuery } from '~/graphql/types.generated'
import { forbiddenBookmarkTags } from '~/lib/consts'

import { Input } from '../Input'
import Tag from './Tag'
import Tags from './Tags'

function PlaceholderTag() {
  return (
    <Listbox.Button
      className={`relative w-full cursor-pointer rounded-md border border-gray-200 bg-white bg-opacity-5 py-2.5 pl-4 pr-10 text-left shadow-sm dark:border-gray-700 dark:bg-gray-700 text-quaternary`}
    >
      Choose tags...
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </Listbox.Button>
  )
}

function AvailableTag({
  tag,
  selected = false,
}: {
  tag: string
  selected?: boolean
}) {
  return (
    <Listbox.Option
      className={`text-primary relative flex flex-none cursor-pointer select-none p-1`}
      value={tag}
    >
      <Tag name={tag} icon={selected ? <Check size={14} /> : null} />
    </Listbox.Option>
  )
}

export default function TagPicker({
  filter = (t) => true,
  onChange,
  onError,
  defaultValue = undefined,
}) {
  const { data, loading } = useGetTagsQuery()
  const [selected, setSelected] = React.useState(defaultValue)
  const [isNew, setNew] = React.useState(false)
  const [newTag, setNewTag] = React.useState('')

  if (loading) return null

  function handleChange(val) {
    if (val.includes('__new_tag_picker')) {
      const idx = val.indexOf('__new_tag_picker')
      val.splice(idx, 1)
      setNew(true)
      setSelected(val)
    } else if (val.includes('__clear_tag_picker')) {
      setSelected([])
      onChange([])
      setNew(false)
    } else {
      setSelected(val)
      onChange(val)
    }
  }

  function unselectTag(tag) {
    const unselected = selected.filter((t) => t !== tag)
    setSelected(unselected)
    onChange(unselected)
  }

  function isNotTagged(tag: string) {
    return (
      selected.findIndex(
        (s) => s.toLocaleLowerCase() === tag.toLocaleLowerCase()
      ) === -1
    )
  }

  function handleNewTagKeyDown(evt) {
    if (evt.key === 'Enter') {
      let newVal = evt.target.value || ''
      if (newVal && isNotTagged(newVal)) {
        const newSelected = [...selected, newVal]
        setSelected(newSelected)
        onChange(newSelected)
      }
      setNewTag('')
    }
  }

  function isNotForbiddenTag(tag: string) {
    return forbiddenBookmarkTags.indexOf(tag) === -1
  }

  function handleNewTagChange(evt) {
    let newVal = evt.target.value || ''
    if (newVal.includes('\n') || newVal.includes(',')) {
      const tags = newVal.split(/[\n,]/)
      const editingTag = tags.pop() // remove the last one
      const newTags = tags.filter(
        (t) => t !== '' && isNotTagged(t) && isNotForbiddenTag(t)
      )

      const forbiddenTags = tags.filter((t) => !isNotForbiddenTag(t))
      if (forbiddenTags.length > 0) {
        onError(`Forbidden tags: ${forbiddenTags.join(', ')}`)
      } else {
        onError('')
      }

      const newSelected = [...selected, ...newTags]
      setSelected(newSelected)
      onChange(newSelected)
      setNewTag(editingTag)
      return
    } else {
      setNewTag(newVal)
    }
  }

  const isNotSelected = !selected || selected.length === 0

  return (
    <Listbox value={selected} onChange={handleChange} multiple={true}>
      <div className="relative z-10 mt-1">
        {isNotSelected ? (
          <PlaceholderTag />
        ) : (
          <Listbox.Button
            className={`relative w-full cursor-pointer rounded-md border border-gray-200 bg-white bg-opacity-5 py-2.5 pl-4 pr-10 text-left shadow-sm dark:border-gray-700 dark:bg-gray-700 text-quaternary`}
          >
            <Tags
              tags={selected}
              onClick={(e, tag) => {
                unselectTag(tag)
                e.preventDefault()
              }}
            />
          </Listbox.Button>
        )}
        <Listbox.Options className="mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white text-base shadow-sm dark:border-gray-700 dark:bg-gray-700">
          <span className="p-2 mt-1 text-primary text-sm">Available Tags:</span>
          <div className="flex flex-wrap p-2">
            {data.tags
              .filter((t) => (filter ? filter(t) : true))
              .filter((t) => !selected.includes(t.name))
              .map((tag) => (
                <AvailableTag key={tag.name} tag={tag.name} />
              ))}
          </div>
          <div className="w-full flex border-t border-gray-150 p-2 dark:border-gray-600">
            <Listbox.Option
              className={`text-primary relative flex flex-none cursor-pointer select-none p-1`}
              value={'__clear_tag_picker'}
            >
              <Tag name={'__clear_tag_picker'} />
            </Listbox.Option>
            <Listbox.Option
              className={`text-primary relative flex flex-none cursor-pointer select-none p-1`}
              value={'__new_tag_picker'}
            >
              <Tag name={'__new_tag_picker'} />
            </Listbox.Option>
          </div>
        </Listbox.Options>
        {isNew && (
          <div className="mt-1 w-full">
            <Input
              value={newTag}
              onChange={handleNewTagChange}
              onKeyDown={handleNewTagKeyDown}
              placeholder="New Tag"
            />
          </div>
        )}
      </div>
    </Listbox>
  )
}
