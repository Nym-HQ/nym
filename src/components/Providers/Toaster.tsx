import * as React from 'react'
import { Toaster } from 'react-hot-toast'

export function Toast() {
  // react-hot-toast's <Toaster> renders differently on the server vs the client
  // (React 19 flags this as a hydration mismatch). Toasts are client-only anyway,
  // so render it only after mount to avoid the mismatch.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      toastOptions={{
        // Define default options
        className: 'bg-white dark:bg-gray-700 text-primary',
        duration: 2000,
        success: {
          duration: 2000,
          iconTheme: {
            primary: 'green',
            secondary: 'black',
          },
        },
        error: {
          duration: 2000,
          iconTheme: {
            primary: 'red',
            secondary: 'white',
          },
        },
      }}
    />
  )
}
