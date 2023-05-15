import { LoadingSpinner } from '../LoadingSpinner'
import { MarkdownRenderer } from '../MarkdownRenderer'

export interface ChatMessageType {
  username: string
  userImage: string
  message: string
  isPresenter: boolean
  loading?: boolean
}

export const ChatMessage = ({
  isPresenter,
  userImage,
  username,
  message,
  loading,
}: ChatMessageType) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row space-x-2 align-center">
        <img
          src={userImage}
          width={32}
          height={32}
          alt={username}
          className="rounded-full border-teal-100"
        />
        <span className="text-primary">{username}</span>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <MarkdownRenderer className="text-base text-primary">
          {message}
        </MarkdownRenderer>
      )}
    </div>
  )
}
