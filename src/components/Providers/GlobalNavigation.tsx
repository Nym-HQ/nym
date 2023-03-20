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

  function setSubscribeFormOpen(isSubscribeFormOpen) {
    return setState({ ...state, isSubscribeFormOpen })
  }

  const initialState = {
    ...globalNavigationContext,
    setIsOpen,
    setSubscribeFormOpen,
  }

  const [state, setState] = React.useState(initialState)

  useEffect(() => {
    const eventListener = () => {
      setSubscribeFormOpen(true)
    }
    window.addEventListener('custom.action.openSubscribeForm', eventListener)
    return () => {
      window.removeEventListener(
        'custom.action.openSubscribeForm',
        eventListener
      )
    }
  }, [])

  return (
    <GlobalNavigationContext.Provider value={state}>
      {children}
    </GlobalNavigationContext.Provider>
  )
}
