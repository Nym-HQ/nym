import * as React from 'react'
import { Plus } from 'react-feather'

import { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { SignInDialog } from '~/components/SignInDialog'
import { useContextQuery } from '~/graphql/types.generated'

import SegmentedControl from '../SegmentedController'
import { AddQuestionDialog } from './AddQuestionDialog'
import { QuestionsContext } from './QuestionsList'

export function AMATitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()
  const { setFilterPending, filterPending } = React.useContext(QuestionsContext)

  function getAddButton() {
    if (!data?.context?.viewer) {
      return (
        <SignInDialog
          trigger={
            <GhostButton
              aria-label="Ask a question"
              size="small-square"
              data-cy="open-add-question-dialog"
            >
              <Plus size={16} />
            </GhostButton>
          }
        />
      )
    }

    return (
      <AddQuestionDialog
        trigger={
          <GhostButton
            aria-label="Ask a question"
            size="small-square"
            data-cy="open-add-question-dialog"
          >
            <Plus size={16} />
          </GhostButton>
        }
      />
    )
  }

  function trailingAccessory() {
    return <div className="flex items-center space-x-2">{getAddButton()}</div>
  }

  function getChildren() {
    // if (data?.context?.viewer?.isAdmin) {
      return (
        <div className="pt-2 pb-1">
          <SegmentedControl
            onSetActiveItem={() => setFilterPending(!filterPending)}
            active={filterPending ? 'pending' : 'answered'}
            items={[
              { id: 'answered', label: 'Answered' },
              { id: 'pending', label: 'Pending' },
            ]}
          />
        </div>
      )
    // }
    // return null
  }

  return (
    <TitleBar
      scrollContainerRef={scrollContainerRef}
      title="Ask a Question"
      trailingAccessory={trailingAccessory()}
    >
      {getChildren()}
    </TitleBar>
  )
}
