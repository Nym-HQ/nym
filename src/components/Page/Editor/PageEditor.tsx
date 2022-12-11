import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { Switch } from '~/components/Switch'

import { PageEditorActions } from './PageEditorActions'
import { PageEditorComposer } from './PageEditorComposer'
import { PageEditorMetaSidebar } from './PageEditorMetaSidebar'
import { PageEditorPreview } from './PageEditorPreview'
import { PreviewSwitch } from './PreviewSwitch'

export const PageEditorContext = React.createContext({
  draftState: {
    title: '',
    text: '',
    path: '',
    slug: '',
    excerpt: '',
    featured: false,
    publishedAt: null,
  },
  setDraftState: (draftObj: unknown) => {},
  existingPage: null,
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen: boolean) => {},
  isPreviewing: false,
  setIsPreviewing: (isPreviewing: boolean) => {},
})

export function PageEditor({ slug: propsSlug = '', site, page }) {
  const scrollContainerRef = React.useRef(null)

  const defaultDraftState = {
    title: page?.title || '',
    text: page?.text || '',
    path: page?.path || '',
    slug: page?.slug || '',
    excerpt: page?.excerpt || '',
    featured: page?.featured || false,
    publishedAt: page?.publishedAt || null,
  }

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)

  const existingPage = page
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState(false)

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
      <PageEditorMetaSidebar />
    </PageEditorContext.Provider>
  )
}
