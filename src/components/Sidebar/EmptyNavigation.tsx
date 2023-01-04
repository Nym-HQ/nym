import * as React from 'react'

import { useContextQuery } from '~/graphql/types.generated'

import { NavigationLink } from './NavigationLink'

export function EmptySidebarNavigation() {
  const sections = []
  const { data } = useContextQuery()

  return (
    <div className="flex-1 px-3 py-3 space-y-1">
      {sections.map((section, i) => {
        return (
          <ul key={i} className="space-y-1">
            {section.label && (
              <h4
                key={i}
                className="px-2 pt-5 pb-2 text-xs font-semibold text-gray-1000 text-opacity-40 dark:text-white"
              >
                {section.label}
              </h4>
            )}
            {section.items.map((item, j) => (
              <NavigationLink key={j} link={item} site={data?.context?.site} />
            ))}
          </ul>
        )
      })}
    </div>
  )
}
