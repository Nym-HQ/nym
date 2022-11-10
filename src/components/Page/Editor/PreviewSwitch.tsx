import * as React from 'react'

import { Switch } from '~/components/Switch'

import { PageEditorContext } from './PageEditor'

export function PreviewSwitch() {
  const context = React.useContext(PageEditorContext)
  const { isPreviewing, setIsPreviewing } = context

  return (
    <Switch
      label={'Preview'}
      defaultEnabled={isPreviewing}
      onChange={(val) => setIsPreviewing(val)}
    />
  )
}
