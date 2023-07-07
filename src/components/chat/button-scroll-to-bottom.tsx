'use client'

import * as React from 'react'

import { type ButtonProps, Button } from '~/components/chat/ui/button'
import { IconArrowDown } from '~/components/chat/ui/icons'
import { useAtBottom } from '~/lib/hooks/use-at-bottom'
import { cn } from '~/lib/utils'

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'absolute right-4 top-1 z-10 bg-white dark:bg-black transition-opacity duration-300 sm:right-8 md:top-2',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth',
        })
      }
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  )
}
