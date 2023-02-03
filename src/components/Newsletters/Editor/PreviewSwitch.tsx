import * as React from 'react'

import { Switch } from '~/components/Switch'

import { NewsletterTemplateEditorContext } from './NewsletterTemplateEditor'

export function PreviewSwitch() {
  const context = React.useContext(NewsletterTemplateEditorContext)
  const { isPreviewing, setIsPreviewing } = context

  return (
    <Switch
      label={'Preview'}
      defaultEnabled={isPreviewing}
      onChange={(val) => setIsPreviewing(val)}
    />
  )
}
