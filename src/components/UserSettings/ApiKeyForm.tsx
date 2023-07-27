import * as React from 'react'
import { BiInfoCircle } from 'react-icons/bi'

import Button from '~/components/Button'
import { Input } from '~/components/Input'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import {
  GetViewerWithSettingsQuery,
  useSetUserApiKeyMutation,
} from '~/graphql/types.generated'
import { useCopyToClipboard } from '~/lib/hooks/use-copy-to-clipboard'

import { IconCheck, IconCopy } from '../chat/ui/icons'
import { Tooltip } from '../Tooltip'

export function ApiKeyForm(props: {
  viewer: GetViewerWithSettingsQuery['context']['viewer']
}) {
  const { viewer } = props
  const [apiKey, setApiKey] = React.useState(viewer?.api_key)
  const [error, setError] = React.useState(null)
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(apiKey || '')
  }

  const [setUserApiKey, setUserApiKeyResponse] = useSetUserApiKeyMutation({
    onError(err) {
      setError(err)
    },
    onCompleted(resp) {
      setApiKey(resp?.setUserApiKey?.api_key || '')
    },
  })

  React.useEffect(() => {
    setApiKey(viewer?.api_key || '')
  }, [props.viewer])

  function onSubmit(e) {
    e.preventDefault()
    if (setUserApiKeyResponse.loading) return
    setUserApiKey({
      variables: {
        data: {
          regenApiKey: e.nativeEvent.submitter.value === 'regenApiKey',
          clearApiKey: e.nativeEvent.submitter.value === 'clearApiKey',
        },
      },
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-primary font-semibold">
        API Key
        <Tooltip content="This API Key can be used to access GraphQL APIs on your behalf!">
          <span className="relative ml-1 inline-block">
            <BiInfoCircle />
          </span>
        </Tooltip>
      </p>

      <form className="space-y-2" onSubmit={onSubmit}>
        <div className="relative group">
          <Input
            type="text"
            placeholder={'API Key'}
            value={apiKey}
            autoFocus
            disabled={true}
            style={{ paddingRight: '3rem' }}
          />
          <div className="flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:right-1 md:top-1 md:opacity-0">
            <Button type="button" variant="ghost" size="icon" onClick={onCopy}>
              {isCopied ? <IconCheck /> : <IconCopy />}
              <span className="sr-only">Copy API Key</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            type="submit"
            value="regenApiKey"
            disabled={setUserApiKeyResponse.loading}
          >
            {setUserApiKeyResponse.loading && <LoadingSpinner />}{' '}
            {apiKey ? 'Regenerate' : 'Generate'}
          </Button>
          <Button
            type="submit"
            value="clearApiKey"
            disabled={setUserApiKeyResponse.loading}
          >
            {setUserApiKeyResponse.loading && <LoadingSpinner />}
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}
