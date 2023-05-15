import Link from 'next/link'
import * as React from 'react'

import { PageAccess, PostAccess } from '~/graphql/types.generated'

interface Props {
  access: PostAccess | PageAccess
  obj: 'Page' | 'Post'
}

export function Paywall({ access, obj }: Props) {
  const [darkMode, setDarkMode] = React.useState(false)

  React.useEffect(() => {
    const isDarkMode =
      window?.matchMedia &&
      window?.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDarkMode) setDarkMode(true)
  }, [])

  let cta
  if (access == PostAccess.Members || access === PageAccess.Members) {
    cta = (
      <>
        This {obj.toLocaleLowerCase()} is for Members Only. Please{' '}
        <Link href="/login">
          <a className="text-sky-500">join</a>
        </Link>
        .
      </>
    )
  } else if (
    access == PostAccess.PaidMembers ||
    access === PageAccess.PaidMembers
  ) {
    cta = (
      <>
        This {obj.toLocaleLowerCase()} is for Paid Members Only. Please{' '}
        <Link href="/login">
          <a className="text-sky-500">join</a>
        </Link>
        .
      </>
    )
  }

  return (
    <>
      <div
        style={{
          boxShadow: `0 1px 3px rgba(0,0,0,.2)`,
          minHeight: 'calc(100vh - 196px)',
        }}
        className={`w-full filter-blur absolute bottom-0 z-10 flex items-center justify-center space-x-3 border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60`}
      >
        <div className="flex flex-none items-center justify-center">
          <span className="flex items-center space-x-3">
            <h4 className="text-primary transform-gpu text-sm font-normal line-clamp-1">
              {cta}
            </h4>
          </span>
        </div>
      </div>
    </>
  )
}
