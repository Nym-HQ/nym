import * as React from 'react'
import ReactVisibilitySensor from 'react-visibility-sensor'

import { ListItem } from '~/components/ListDetail/ListItem'
import { EmailSubscriptionListItemFragment } from '~/graphql/types.generated'

interface NewsletterSubscribersListItemProps {
  emailSubscription: EmailSubscriptionListItemFragment
  active: boolean
}

export const NewsletterSubscribersListItem =
  React.memo<NewsletterSubscribersListItemProps>(
    ({ emailSubscription, active }) => {
      const [isVisible, setIsVisible] = React.useState(false)

      function handleClick(e) {
        if (e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      return (
        <ReactVisibilitySensor
          partialVisibility
          onChange={(visible: boolean) => !isVisible && setIsVisible(visible)}
        >
          <ListItem
            key={emailSubscription.id}
            title={emailSubscription.email}
            byline={
              <div className="flex items-center space-x-2">
                {/* <span>{emailSubscription.email}</span> */}
              </div>
            }
            active={active}
            onClick={(e) => handleClick(e)}
            href={''}
            as={''}
          />
        </ReactVisibilitySensor>
      )
    }
  )
