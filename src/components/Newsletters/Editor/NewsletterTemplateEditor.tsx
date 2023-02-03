import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'

import { NewsletterTemplateEditorComposer } from './NewsletterTemplateEditorComposer'
import { NewsletterTemplateEditorPreview } from './NewsletterTemplateEditorPreview'
import { PreviewSwitch } from './PreviewSwitch'

interface NewsletterTemplateDraftState {
  subject: string
  text: string
  data: any
}
interface NewsletterTemplateDraftError {
  field: string
  message: string
}

export const NewsletterTemplateEditorContext = React.createContext({
  draftState: {
    subject: '',
    text: '',
    data: {} as any,
  } as NewsletterTemplateDraftState,
  setDraftState: (draftObj: unknown) => {},
  existingNewsletterTemplate: null,
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen: boolean) => {},
  isPreviewing: false,
  setIsPreviewing: (isPreviewing: boolean) => {},
  isDraftValid: false,
  draftErrors: [] as NewsletterTemplateDraftError[],
})

function checkIfDraftIsValid(
  draftState: NewsletterTemplateDraftState,
  existingPost: any
) {
  const errors = []
  if (!draftState.subject) {
    errors.push({
      field: 'subject',
      message: 'Subject is required',
    } as NewsletterTemplateDraftError)
  }

  return {
    isDraftValid: errors.length == 0,
    draftErrors: errors,
  }
}

export function NewsletterTemplateEditor({
  slug: propsSlug = '',
  site,
  template,
}) {
  const scrollContainerRef = React.useRef(null)

  const defaultDraftState = {
    subject: template?.subject || '',
    text: template?.text || '',
    data: template?.data || {},
  } as NewsletterTemplateDraftState

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)

  const existingNewsletterTemplate = template
  let validInit = checkIfDraftIsValid(
    defaultDraftState,
    existingNewsletterTemplate
  )

  const [isDraftValid, setIsDraftValid] = React.useState(validInit.isDraftValid)
  const [draftErrors, setDraftErrors] = React.useState(validInit.draftErrors)
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState(false)

  React.useEffect(() => {
    let validNext = checkIfDraftIsValid(draftState, existingNewsletterTemplate)
    setIsDraftValid(validNext.isDraftValid)
    setDraftErrors(validNext.draftErrors)
  }, [draftState])

  React.useEffect(() => {
    // if navigating between drafts, reset the state each time with the correct
    // template data
    setDraftState(defaultDraftState)
  }, [propsSlug])

  const defaultContextValue = {
    existingNewsletterTemplate,
    draftState,
    setDraftState,
    sidebarIsOpen,
    setSidebarIsOpen,
    isPreviewing,
    setIsPreviewing,
    isDraftValid,
    draftErrors,
  }

  return (
    <NewsletterTemplateEditorContext.Provider value={defaultContextValue}>
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/templates'}
          scrollContainerRef={scrollContainerRef}
          title=""
          trailingAccessory={null}
          leadingAccessory={<PreviewSwitch />}
        />

        {isPreviewing ? (
          <NewsletterTemplateEditorPreview />
        ) : (
          <NewsletterTemplateEditorComposer site={site} />
        )}
      </Detail.Container>
    </NewsletterTemplateEditorContext.Provider>
  )
}
