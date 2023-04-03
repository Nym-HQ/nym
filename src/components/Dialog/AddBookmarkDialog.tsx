import * as React from 'react'

import { AddBookmarkForm } from '../Bookmarks/AddBookmarkForm'
import { GlobalNavigationContext } from '../Providers/GlobalNavigation'
import DialogComponent from './Dialog'

export default function AddBookmarkDialog() {
  const { newBookmarkUrl, isAddBookmarkFormOpen, setAddBookmarkFormOpen } =
    React.useContext(GlobalNavigationContext)

  return (
    <DialogComponent
      title={'Add bookmark'}
      isOpen={isAddBookmarkFormOpen}
      onClose={() => setAddBookmarkFormOpen(false)}
      modalContent={({ closeModal }) => (
        <AddBookmarkForm initUrl={newBookmarkUrl} closeModal={closeModal} />
      )}
    />
  )
}
