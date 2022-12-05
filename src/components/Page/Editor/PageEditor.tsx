import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { Switch } from '~/components/Switch'
import { useGetPageQuery } from '~/graphql/types.generated'

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

export function PageEditor({ slug: propsSlug = '' }) {
  const scrollContainerRef = React.useRef(null)
  const { data } = useGetPageQuery({ variables: { slug: propsSlug } })

  const defaultDraftState = {
    title: data?.page?.title || '',
    text: data?.page?.text || '',
    path: data?.page?.path || '',
    slug: data?.page?.slug || '',
    excerpt: data?.page?.excerpt || '',
    featured: data?.page?.featured || false,
    publishedAt: data?.page?.publishedAt || null,
  }

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)

  const existingPage = data?.page
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

        {isPreviewing ? <PageEditorPreview /> : <PageEditorComposer />}
      </Detail.Container>
      <PageEditorMetaSidebar />
    </PageEditorContext.Provider>
  )
}
