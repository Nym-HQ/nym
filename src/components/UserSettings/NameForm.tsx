import * as React from 'react'

import Button from '~/components/Button'
import { Input } from '~/components/Input'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import {
  GetViewerWithSettingsQuery,
  useEditUserMutation,
} from '~/graphql/types.generated'

export function NameForm(props: {
  viewer: GetViewerWithSettingsQuery['context']['viewer']
}) {
  const { viewer } = props
  const [name, setName] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)
  const [error, setError] = React.useState(null)

  const [editUser, editUserResponse] = useEditUserMutation({
    variables: {
      data: {
        name,
      },
    },
    onError() {},
    onCompleted() {
      setIsEditing(false)
    },
  })

  function onSubmit(e) {
    e.preventDefault()
    if (editUserResponse.loading) return
    if (name === viewer.name) return setIsEditing(false)
    editUser()
  }

  function handleNameChange(e) {
    setError(false)
    setName(e.target.value)
  }

  return (
    <div className="space-y-2">
      <p className="text-primary font-semibold">Name</p>

      {viewer.name && (
        <div className="text-primary flex space-x-2">
          <span>{viewer.name}</span>
          <span>·</span>
          <button
            className="cursor-pointer font-medium text-blue-500"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      )}

      {isEditing && (
        <form className="space-y-2" onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder={'Choose a name'}
            value={name}
            autoFocus
            onChange={handleNameChange}
          />
          <div className="flex justify-between">
            <Button type="submit">
              {editUserResponse.loading ? <LoadingSpinner /> : 'Save name'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
