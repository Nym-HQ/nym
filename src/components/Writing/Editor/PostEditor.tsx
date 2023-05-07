import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { PostAccess } from '~/graphql/types.generated'

import { PostEditorActions } from './PostEditorActions'
import { PostEditorComposer } from './PostEditorComposer'
import { PostEditorMetaSidebar } from './PostEditorMetaSidebar'
import { PostEditorPreview } from './PostEditorPreview'
import { PreviewSwitch } from './PreviewSwitch'

interface PostDraftState {
  title: string
  text: string
  data: any
  slug: string
  excerpt: string
  publishedAt: Date | null
  access: PostAccess
}
interface PostDraftError {
  field: string
  message: string
}

export const PostEditorContext = React.createContext({
  draftState: {
    title: '',
    text: '',
    data: {} as any,
    slug: '',
    excerpt: '',
    publishedAt: null,
    access: PostAccess.Public,
  } as PostDraftState,
  setDraftState: (draftObj: unknown) => {},
  existingPost: null,
  sidebarIsOpen: false,
  setSidebarIsOpen: (isOpen: boolean) => {},
  isPreviewing: false,
  setIsPreviewing: (isPreviewing: boolean) => {},
  publishNewsletter: false,
  setPublishNewsletter: (publishNewsletter: boolean) => {},
  isDraftValid: false,
  draftErrors: [] as PostDraftError[],
})

function checkIfDraftIsValid(draftState: PostDraftState, existingPost: any) {
  const errors = []
  if (!draftState.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    } as PostDraftError)
  }
  if (!draftState.slug) {
    errors.push({
      field: 'slug',
      message: 'Slug is required',
    } as PostDraftError)
  }

  return {
    isDraftValid: errors.length == 0,
    draftErrors: errors,
  }
}

export function PostEditor({ slug: propsSlug = '', site, post }) {
  const scrollContainerRef = React.useRef(null)

  const defaultDraftState = {
    title: post?.title || '',
    text: post?.text || '',
    data: post?.data || {},
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    publishedAt: post?.publishedAt || null,
    access: post?.access || PostAccess.Public,
  } as PostDraftState

  const [draftState, setDraftState] = React.useState(defaultDraftState)
  const [isPreviewing, setIsPreviewing] = React.useState(false)
  const [publishNewsletter, setPublishNewsletter] = React.useState(false)

  const existingPost = post
  let validInit = checkIfDraftIsValid(defaultDraftState, existingPost)

  const [isDraftValid, setIsDraftValid] = React.useState(validInit.isDraftValid)
  const [draftErrors, setDraftErrors] = React.useState(validInit.draftErrors)
  const [sidebarIsOpen, setSidebarIsOpen] = React.useState(false)

  React.useEffect(() => {
    let validNext = checkIfDraftIsValid(draftState, existingPost)
    setIsDraftValid(validNext.isDraftValid)
    setDraftErrors(validNext.draftErrors)
  }, [draftState])

  React.useEffect(() => {
    // if navigating between drafts, reset the state each time with the correct
    // post data
    setDraftState(defaultDraftState)
  }, [propsSlug])

  const defaultContextValue = {
    existingPost,
    draftState,
    setDraftState,
    sidebarIsOpen,
    setSidebarIsOpen,
    isPreviewing,
    setIsPreviewing,
    publishNewsletter,
    setPublishNewsletter,
    isDraftValid,
    draftErrors,
  }

  return (
    <PostEditorContext.Provider value={defaultContextValue}>
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/writing'}
          scrollContainerRef={scrollContainerRef}
          title=""
          trailingAccessory={<PostEditorActions />}
          leadingAccessory={<PreviewSwitch />}
        />

        {isPreviewing ? (
          <PostEditorPreview />
        ) : (
          <PostEditorComposer site={site} />
        )}
      </Detail.Container>
      <PostEditorMetaSidebar site={site} />
    </PostEditorContext.Provider>
  )
}
