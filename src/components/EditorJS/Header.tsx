import Header from '@editorjs/header'

import { slugifyString } from '~/lib/utils'

export default class HeaderExtended extends Header {
  getTag() {
    const tag = super.getTag()
    if (['H1', 'H2', 'H3', 'H4'].includes(tag.tagName)) {
      tag.setAttribute('id', slugifyString(tag.innerHTML).substring(0, 50))
    }
    return tag
  }
}
