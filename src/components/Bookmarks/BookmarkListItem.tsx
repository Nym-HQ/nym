import * as React from 'react'
import { Link as LinkIcon } from 'react-feather'
import ReactVisibilitySensor from 'react-visibility-sensor'

import { ListItem } from '~/components/ListDetail/ListItem'
import { BookmarkListItemFragment } from '~/graphql/types.generated'

interface Props {
  bookmark: BookmarkListItemFragment
  active: boolean
  tag?: string
}

export const BookmarksListItem = React.memo<Props>(
  ({ tag = '', bookmark, active }) => {
    const [isVisible, setIsVisible] = React.useState(false)

    function handleClick(e, bookmark) {
      if (e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        window.open(bookmark.url, '_blank').focus()
      }
    }

    return (
      <ReactVisibilitySensor
        partialVisibility
        onChange={(visible: boolean) => !isVisible && setIsVisible(visible)}
      >
        <ListItem
          key={bookmark.id}
          title={bookmark.title}
          byline={
            <div className="flex items-center space-x-2">
              {bookmark.faviconUrl && isVisible ? (
                <img
                  src={bookmark.faviconUrl}
                  alt={`Favicon for ${bookmark.host}`}
                  className="h-4 w-4 rounded"
                  width="16px"
                  height="16px"
                />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center">
                  <LinkIcon size={12} />
                </span>
              )}
              <span>{bookmark.host}</span>
            </div>
          }
          active={active}
          href="/bookmark/[id]"
          as={
            tag
              ? `/bookmarks/${tag}/${bookmark.id}`
              : `/bookmark/${bookmark.id}`
          }
          onClick={(e) => handleClick(e, bookmark)}
        />
      </ReactVisibilitySensor>
    )
  }
)
