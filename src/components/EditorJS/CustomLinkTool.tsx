import LinkTool from '@editorjs/link'

export class CustomLinkTool extends LinkTool {
  data: any
  nodes: any

  /**
   * @param {object} options - Tool constructor options fot from Editor.js
   * @param {LinkToolData} options.data - previously saved data
   * @param {LinkToolConfig} options.config - user config for Tool
   * @param {object} options.api - Editor.js API
   * @param {boolean} options.readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    super({ data, config, api, readOnly })
  }

  async fetchLinkData(url) {
    const that = this as any
    if (url.match(/https:\/\/twitter.com\/.*\/status/g)) {
      that.showProgress()
      this.data = { link: url }

      let body: any = {}
      try {
        const resp = await fetch(
          `${that.config.endpoint}?url=${encodeURIComponent(url)}`
        )
        body = await resp.json()
      } catch (e) {
        console.error('Failed to get metadata', e)
      }

      that.onFetch({
        ...body,
        meta: {
          title: url,
          description: '',
          ...body?.meta,
          html: body?.html,
        },
      })
    } else {
      return await super.fetchLinkData(url)
    }
  }

  get CSS() {
    return super.CSS
  }

  showLinkPreview(meta) {
    const { html } = meta
    if (html) {
      const modifiedMeta = {
        ...meta,
        title: null,
        description: null,
      }
      super.showLinkPreview(modifiedMeta)
      this.nodes.linkContent.innerHTML = html
      this.nodes.linkContent.classList.add('link-tool__content--html')
    } else {
      super.showLinkPreview(meta)
    }
  }

  /**
   * Paste configuration to enable pasted URLs processing by Editor
   *
   * @returns {object} - object of patterns which contain regx for pasteConfig
   */
  static get pasteConfig() {
    return {
      patterns: {
        twitter:
          /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+?.*)?$/,
      },
    }
  }

  /**
   * Handle pasted url and return Service object
   *
   * @param {PasteEvent} event - event with pasted data
   */
  async onPaste(event) {
    const { key: service, data: url } = event.detail
    await this.fetchLinkData(url)
  }
}
