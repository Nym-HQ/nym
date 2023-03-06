import * as React from 'react'

import { Sidebar } from '~/components/Sidebar'
import { useContextQuery } from '~/graphql/types.generated'

interface Props {
  list: React.ReactElement | null
  detail: React.ReactElement | null
  hasDetail?: boolean
}

export function ListDetailView({ list, detail, hasDetail = false }: Props) {
  return (
    <div className="flex w-full">
      {list && (
        <div
          id="list"
          className={`bg-dots ${
            hasDetail ? 'hidden lg:flex' : 'min-h-screen-safe pb-safe w-full'
          }`}
        >
          {list}
        </div>
      )}
      {detail}
    </div>
  )
}

export function SiteLayout({ children }) {
  const { data: context } = useContextQuery()

  return (
    <>
      {context?.context?.site?.attach_css && (
        <style jsx global>
          {`
            ${context.context.site.attach_css}
          `}
        </style>
      )}
      <div className="relative flex h-full min-h-screen-safe pb-safe w-full">
        <Sidebar />

        <div className="flex flex-1">{children}</div>
      </div>
    </>
  )
}
