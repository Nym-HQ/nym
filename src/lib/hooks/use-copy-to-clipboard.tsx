'use client'

import * as React from 'react'

export interface useCopyToClipboardProps {
  timeout?: number
}

export function useCopyToClipboard({
  timeout = 2000,
}: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = React.useState<Boolean>(false)

  const copyToClipboard = (value: string) => {
    if (typeof window === 'undefined') {
      console.warn('Copy to clipboard is only supported on Browsers!')
      return
    }

    if (!value) {
      return
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => {
        setIsCopied(true)

        setTimeout(() => {
          setIsCopied(false)
        }, timeout)
      })
    } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement('textarea')
      textArea.value = value

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'

      document.body.prepend(textArea)
      textArea.select()

      try {
        document.execCommand('copy')
        setIsCopied(true)

        setTimeout(() => {
          setIsCopied(false)
        }, timeout)
      } catch (error) {
        console.error(error)
      } finally {
        textArea.remove()
      }
    }
  }

  return { isCopied, copyToClipboard }
}
