import { NextPageContext } from 'next'
import * as React from 'react'
import { useEffect } from 'react'

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

  return (
    <GlobalNavigationContext.Provider value={state}>
      {children}
    </GlobalNavigationContext.Provider>
  )
}
