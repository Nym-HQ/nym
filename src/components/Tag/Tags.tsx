import * as React from 'react'

import Tag from './Tag'

export default function Tags({ tags, onClick = (e, tag) => {} }) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap space-x-2">
      {tags
        .map((tag) => tag.name || tag)
        .map((tag) => (
          <Tag key={tag} name={tag} onClick={(e) => onClick(e, tag)} />
        ))}
    </div>
  )
}
