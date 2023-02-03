import edjsParser from '@herii/editorjs-parser'
import * as React from 'react'
import toast from 'react-hot-toast'

import { PrimaryButton } from '~/components/Button'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'

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
  if (!draftState.data || draftState.data.length == 0) {
    errors.push({
      field: 'body',
      message: 'Please enter some content of the newsletter',
    } as NewsletterTemplateDraftError)
  }

  return {
    isDraftValid: errors.length == 0,
    draftErrors: errors,
  }
}

export function NewsletterTemplateEditor({ site, template }) {
  const scrollContainerRef = React.useRef(null)

  const defaultDraftState = {
    subject: template?.subject || '',
    text: template?.text || '',
    data: template?.data || {},
  } as NewsletterTemplateDraftState

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)
  const [sending, setSending] = React.useState(false)

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

  const sendNewsletter = async () => {
    try {
      setSending(true)

      const parser = new edjsParser()
      const blockHTML = parser.parse(draftState.data)
      const text = blockHTML.replace(/<[^>]*>?/gm, '')

      // Send out newsletter
      return await fetch('/api/newsletters', {
        method: 'POST',
        body: JSON.stringify({
          subject: draftState.subject,
          html: blockHTML,
          text: text,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res) => {
            if (res.status < 300) {
              toast.success('Newsletter sent out! 🎉')
            } else {
              toast.error("Couldn't send out newsletter. 😢")
            }
          },
          (err) => {
            toast.error("Couldn't send out newsletter. 😢")
          }
        )
        .finally(() => {
          setSending(false)
        })
    } catch (error) {
      console.error('Failed to send out newsletter', error)
    } finally {
      setTimeout(() => {
        setSending(false)
      })
    }
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
        <div className="px-4 py-3 sm:px-6 items-end">
          <PrimaryButton
            type="submit"
            onClick={sendNewsletter}
            disabled={sending || !isDraftValid}
          >
            {sending && <LoadingSpinner />} Send Newsletter
          </PrimaryButton>
        </div>
      </Detail.Container>
    </NewsletterTemplateEditorContext.Provider>
  )
}
