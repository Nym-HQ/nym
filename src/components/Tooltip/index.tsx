import 'tippy.js/dist/tippy.css'

import Tippy from '@tippyjs/react'
import * as React from 'react'

interface Props {
  content: string
  placement?: typeof Tippy.defaultProps.placement
  style?: any
  children: any
}

export function Tooltip(props: Props) {
  const { style = {}, placement = 'auto', content, children, ...rest } = props

  return (
    <Tippy
      placement={placement}
      touch={false}
      arrow={true}
      hideOnClick={false}
      content={
        <span className="text-sm font-medium" style={{ ...style }}>
          {content}
        </span>
      }
      {...rest}
    >
      {children}
    </Tippy>
  )
}
