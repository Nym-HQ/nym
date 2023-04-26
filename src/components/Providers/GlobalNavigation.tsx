import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'
import { useEffect } from 'react'

import { useContextQuery } from '~/graphql/types.generated'

interface Props {
  children?: any
  pageProps: NextPageContext
}

const globalNavigationContext = {
  isOpen: false,
  setIsOpen: (val: boolean) => {},
  isSubscribeFormOpen: false,
  setSubscribeFormOpen: (val: boolean) => {},
  newBookmarkUrl: '',
  isAddBookmarkFormOpen: false,
  setAddBookmarkFormOpen: (val: boolean) => {},
}

export const GlobalNavigationContext = React.createContext(
  globalNavigationContext
)

export function GlobalNavigationContextProvider({
  children,
  pageProps,
}: Props) {
  function setIsOpen(isOpen) {
    return setState({ ...state, isOpen })
  }

  function setSubscribeFormOpen(isSubscribeFormOpen, url: string = '') {
    return setState({ ...state, isSubscribeFormOpen, newBookmarkUrl: url })
  }

  function setAddBookmarkFormOpen(isAddBookmarkFormOpen) {
    return setState({ ...state, isAddBookmarkFormOpen })
  }

  const initialState = {
    ...globalNavigationContext,
    setIsOpen,
    setSubscribeFormOpen,
    setAddBookmarkFormOpen,
  }

  const [state, setState] = React.useState(initialState)
  const { data: context } = useContextQuery()
  const router = useRouter()

  useEffect(() => {
    const openSubscribeFormEventListener = () => {
      setSubscribeFormOpen(true)
    }
    const openAddBookmarkFormEventListener = (event) => {
      setState({
        ...state,
        newBookmarkUrl: event.detail?.url || '',
        isAddBookmarkFormOpen: true,
      })
    }

    window.addEventListener(
      'custom.action.openSubscribeForm',
      openSubscribeFormEventListener
    )
    window.addEventListener(
      'custom.action.openAddBookmarkForm',
      openAddBookmarkFormEventListener
    )

    return () => {
      window.removeEventListener(
        'custom.action.openSubscribeForm',
        openSubscribeFormEventListener
      )
      window.removeEventListener(
        'custom.action.openAddBookmarkForm',
        openAddBookmarkFormEventListener
      )
    }
  }, [])

  const addStyleClass = (className: string, newClassName: string) => {
    return [...(className || '').split(' ').filter((cls) => cls), 'home'].join(
      ' '
    )
  }

  const removeStyleClass = (className: string, removeClassName: string) => {
    const existingClasses = (className || '').split(' ').filter((cls) => cls)
    if (existingClasses.indexOf(removeClassName) > -1) {
      return existingClasses.filter((cls) => cls !== removeClassName).join(' ')
    }
    return className
  }

  useEffect(() => {
    // Set the body class to 'authenticated' if we're authenticated
    if (context?.context?.viewer) {
      document.body.className = addStyleClass(
        document.body.className,
        'authenticated'
      )
    } else {
      document.body.className = removeStyleClass(
        document.body.className,
        'authenticated'
      )
    }
  }, [context])

  useEffect(() => {
    if (document?.body) {
      // Set the body class to 'home' if we're on the home page
      if (router.asPath === '/') {
        document.body.className = addStyleClass(document.body.className, 'home')
      } else {
        document.body.className = removeStyleClass(
          document.body.className,
          'home'
        )
      }
    }
  }, [router.asPath])

  return (
    <GlobalNavigationContext.Provider value={state}>
      {children}
    </GlobalNavigationContext.Provider>
  )
}
