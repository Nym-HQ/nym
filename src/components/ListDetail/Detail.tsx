import * as React from 'react'
import { Compass } from 'react-feather'

import { LoadingSpinner } from '~/components/LoadingSpinner'
import { useContextQuery } from '~/graphql/types.generated'

import Button from '../Button'
import { PoweredByNym } from './PoweredByNym'
import { TitleBar } from './TitleBar'

function ContentContainer(props) {
  return (
    <div
      className="mx-auto w-full max-w-3xl-screen px-4 py-6 pb-10 md:px-8"
      {...props}
    />
  )
}

interface DetailContainerProps {
  children: React.ReactNode
}

const Container = React.forwardRef<HTMLDivElement, DetailContainerProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        id="main"
        className="relative flex max-h-screen-safe w-full flex-col overflow-y-auto bg-white dark:bg-black"
        {...props}
      />
    )
  }
)

function Header(props) {
  return <div className="space-y-3" {...props} />
}

interface TitleProps {
  children: React.ReactNode
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  return (
    <h1
      ref={ref}
      className="text-primary font-sans text-2xl font-bold xl:text-3xl"
      {...props}
    />
  )
})

function Loading() {
  return (
    <Container>
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    </Container>
  )
}

function Null({ type }: { type: '404' | 'Page' | 'Post' | 'Bookmark' }) {
  if (type === 'Page') {
    return (
      <Container>
        <TitleBar title="Not found" />
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-8 text-center lg:px-16">
          <Compass className="text-secondary" size={32} />
          <div className="flex flex-col space-y-1">
            <p className="text-primary font-semibold">
              Nothing here at the moment . Create a page to get started.
            </p>
          </div>
          <Button href="/pages/new">Create new Page</Button>
        </div>
        <PoweredByNym />
      </Container>
    )
  } else if (type === 'Post') {
    return (
      <Container>
        <TitleBar title="Not found" />
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-8 text-center lg:px-16">
          <Compass className="text-secondary" size={32} />
          <div className="flex flex-col space-y-1">
            <p className="text-primary font-semibold">
              Nothing here at the moment . Create a page to get started.
            </p>
          </div>
          <Button href="/writing/new">Create new Post</Button>
        </div>
        <PoweredByNym />
      </Container>
    )
  } else if (type === 'Bookmark') {
    return (
      <Container>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/bookmarks'}
          magicTitle
          title="Not found"
        />
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-8 text-center lg:px-16">
          <Compass className="text-secondary" size={32} />
          <div className="flex flex-col space-y-1">
            <p className="text-primary font-semibold">
              The bookmark you are looking for does not exist anymore.
            </p>
          </div>
        </div>
      </Container>
    )
  } else {
    return (
      <Container>
        <TitleBar title="Not found" />
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-8 text-center lg:px-16">
          <Compass className="text-secondary" size={32} />
          <div className="flex flex-col space-y-1">
            <p className="text-primary font-semibold">
              What you seek does not exist.
            </p>
            <p className="text-tertiary">
              Maybe this link is broken. Maybe something was deleted, or moved.
              In any case, there’s nothing to see here...
            </p>
          </div>
          <Button href="/">Go home</Button>
        </div>
        <PoweredByNym />
      </Container>
    )
  }
}

export const Detail = {
  Container,
  ContentContainer,
  Header,
  Title,
  Loading,
  Null,
}
