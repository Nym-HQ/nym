import Link from 'next/link'
import * as React from 'react'

interface Props {
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement>
}

export function PoweredByNym({ scrollContainerRef = null }: Props) {
  const [darkMode, setDarkMode] = React.useState(false)
  const [currentScrollOffset, _setCurrentScrollOffset] = React.useState(0)

  const currentScrollOffsetRef = React.useRef(currentScrollOffset)
  const setCurrentScrollOffset = (data) => {
    currentScrollOffsetRef.current = data
    _setCurrentScrollOffset(data)
  }

  const handler = React.useCallback(() => {
    const shadowOpacity = scrollContainerRef.current.scrollTop / 200
    setCurrentScrollOffset(shadowOpacity > 0.12 ? 0.12 : shadowOpacity)
  }, [scrollContainerRef])

  React.useEffect(() => {
    scrollContainerRef?.current?.addEventListener('scroll', handler)

    return () =>
      scrollContainerRef?.current?.removeEventListener('scroll', handler)
  }, [scrollContainerRef])

  React.useEffect(() => {
    const isDarkMode =
      window?.matchMedia &&
      window?.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDarkMode) setDarkMode(true)
  }, [])

  return (
    <>
      <div
        style={{
          boxShadow: `0 1px 3px rgba(0,0,0,${currentScrollOffset})`,
          minHeight: '48px',
        }}
        className={`filter-blur sticky bottom-0 z-10 flex items-center justify-center space-x-3 border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60`}
      >
        <div className="flex flex-none items-center justify-center">
          <span className="flex items-center space-x-3">
            <h4 className="text-primary transform-gpu text-sm font-normal line-clamp-1">
              Powered by{' '}
              <Link
                href="https://nymhq.com"
                target="_blank"
                className="inline-flex"
                passHref
              >
                <b>Nym</b>
              </Link>
            </h4>
          </span>
        </div>
      </div>
    </>
  )
}
