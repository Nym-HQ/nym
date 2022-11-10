import { NextPageContext } from 'next'
import * as React from 'react'

interface Props {
  children?: any
  pageProps: NextPageContext
}

const globalNavigationContext = {
  isOpen: false,
  setIsOpen: (val: boolean) => {},
}

export const GlobalNavigationContext = React.createContext(
  globalNavigationContext
)

export function GlobalNavigationContextProvider({
  children,
  pageProps,
}: Props) {
  const initialState = {
    ...globalNavigationContext,
    setIsOpen,
  }

  const [state, setState] = React.useState(initialState)

  function setIsOpen(isOpen) {
    return setState({ ...state, isOpen })
  }

  return (
    <GlobalNavigationContext.Provider value={state}>
      {children}
    </GlobalNavigationContext.Provider>
  )
}
