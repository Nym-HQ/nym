import React from 'react'

import Button from '~/components/Button'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useGetUserQuery } from '~/graphql/types.generated'

import { PoweredByNym } from '../ListDetail/PoweredByNym'

export function UserDetail({ username }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  const { data, loading, error } = useGetUserQuery({ variables: { username } })

  if (error) return null
  if (loading) return <Detail.Loading />

  if (data?.user) {
    const { user } = data
    return (
      <Detail.Container ref={scrollContainerRef}>
        <TitleBar
          magicTitle
          title={user.name}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
        />

        <div className="flex flex-1 flex-col flex-start justify-start">
          <Detail.ContentContainer>
            <Detail.Header>
              <Detail.Title ref={titleRef}>
                Profiles are coming soon
              </Detail.Title>
              <p className="text-tertiary text-xl">
                Check back in the future to see questions, comments, and more...
              </p>
            </Detail.Header>
          </Detail.ContentContainer>
        </div>

        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
    )
  }

  return null
}
