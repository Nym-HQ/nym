import * as React from 'react'

import { DialogComponent } from '~/components/Dialog'

import { AddQuestionForm } from './AddQuestionForm'

export function AddQuestionDialog({ trigger }) {
  return (
    <DialogComponent
      trigger={trigger}
      title={'Ask a Question'}
      modalContent={({ closeModal }) => (
        <AddQuestionForm closeModal={closeModal} />
      )}
    />
  )
}
