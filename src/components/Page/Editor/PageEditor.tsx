import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { PageAccess } from '~/graphql/types.generated'

import { PageEditorActions } from './PageEditorActions'
import { PageEditorComposer } from './PageEditorComposer'
import { PageEditorMetaSidebar } from './PageEditorMetaSidebar'
import { PageEditorPreview } from './PageEditorPreview'
import { PreviewSwitch } from './PreviewSwitch'

interface PageDraftState {
  title: string
  text: string
  data: any
  path: string
  slug: string
  excerpt: string
  featured: boolean
  publishedAt: Date | null
  access: PageAccess
}
interface PageDraftError {
  field: string
  message: string
}

export const PageEditorContext = React.createContext({
  draftState: {
    title: '',
    text: '',
    data: {} as any,
    path: '',
    slug: '',
    excerpt: '',
    featured: false,
    publishedAt: null,
    access: PageAccess.Public,
  } as PageDraftState,
  setDraftState: (draftObj: unknown) => {},
  existingPage: null,
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen: boolean) => {},
  isPreviewing: false,
  setIsPreviewing: (isPreviewing: boolean) => {},
  isDraftValid: false,
  draftErrors: [] as PageDraftError[],
})

function checkIfDraftIsValid(draftState: PageDraftState, existingPost: any) {
  const errors = []
  if (!draftState.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    } as PageDraftError)
  }
  if (!draftState.slug) {
    errors.push({
      field: 'slug',
      message: 'Slug is required',
    } as PageDraftError)
  }

  return {
    isDraftValid: errors.length == 0,
    draftErrors: errors,
  }
}

export function PageEditor({ slug: propsSlug = '', site, page }) {
  const scrollContainerRef = React.useRef(null)

  const defaultDraftState = {
    title: page?.title || '',
    text: page?.text || '',
    data: page?.data || {},
    path: page?.path || '',
    slug: page?.slug || '',
    excerpt: page?.excerpt || '',
    featured: page?.featured || false,
    publishedAt: page?.publishedAt || null,
    access: page?.access || PageAccess.Public,
  } as PageDraftState

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)

  const existingPage = page
  let validInit = checkIfDraftIsValid(defaultDraftState, existingPage)

  const [isDraftValid, setIsDraftValid] = React.useState(validInit.isDraftValid)
  const [draftErrors, setDraftErrors] = React.useState(validInit.draftErrors)
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState(false)

  React.useEffect(() => {
    let validNext = checkIfDraftIsValid(draftState, existingPage)
    setIsDraftValid(validNext.isDraftValid)
    setDraftErrors(validNext.draftErrors)
  }, [draftState])

  React.useEffect(() => {
    // if navigating between drafts, reset the state each time with the correct
    // page data
    setDraftState(defaultDraftState)
  }, [propsSlug])

  const defaultContextValue = {
    existingPage,
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
    <PageEditorContext.Provider value={defaultContextValue}>
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/pages'}
          scrollContainerRef={scrollContainerRef}
          title=""
          trailingAccessory={<PageEditorActions />}
          leadingAccessory={<PreviewSwitch />}
        />

        {isPreviewing ? (
          <PageEditorPreview />
        ) : (
          <PageEditorComposer site={site} />
        )}
      </Detail.Container>
      <PageEditorMetaSidebar site={site} />
    </PageEditorContext.Provider>
  )
}
