import * as React from 'react'

interface VisibilitySensorProps {
  /** Fires onChange when any part of the element is visible (default behavior). */
  partialVisibility?: boolean
  /** When false, the sensor is disabled and never fires. */
  active?: boolean
  /** Called with the current visibility whenever it changes. */
  onChange?: (visible: boolean) => void
  children?: React.ReactNode
}

/**
 * Drop-in replacement for `react-visibility-sensor`, which is unmaintained and
 * calls `ReactDOM.findDOMNode` — removed in React 19, so it crashed list pages
 * (e.g. /bookmarks) with "findDOMNode is not a function". This uses a native
 * IntersectionObserver instead. Same wrapper-div + `onChange(visible)` contract
 * the callers rely on (`partialVisibility` maps to threshold 0).
 */
function VisibilitySensor({
  active = true,
  onChange,
  children,
}: VisibilitySensorProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  React.useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onChangeRef.current?.(entry.isIntersecting)
      },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [active])

  return <div ref={ref}>{children}</div>
}

export default VisibilitySensor
