import edjsParser from '@herii/editorjs-parser'

/**
 * Render HTML string from EditorJS data
 *
 * @param data - EditorJS data
 * @param config - Config for the EditorJS
 * @returns {string}
 */
export const parseEditorJsDataIntoHtml = (data: any, config: any = {}) => {
  const { linkTool = {} } = config
  const { removeNestedAnchorTags = true } = linkTool

  const customParsers = {
    customBlock: (data, config) => {
      // parsing functionality
      // the config arg is user provided config merged with default config
    },
    linkTool: (data, config) => {
      if (data.meta) {
        if (data.meta.html) {
          if (removeNestedAnchorTags) {
            // remove nested anchor tags : some email providers/clients don't support nested anchor tags
            const regex = /<a(.*?)>(.*?)<\/a>/g
            data.meta.html = data.meta.html.replaceAll(
              regex,
              '<span$1>$2</span>'
            )
          }
          return (
            `<a href="${data.link}" target="_blank" rel="noopener noreferrer">` +
            `<div style="margin-top: 1rem; margin-bottom: 1rem; border: solid 1px #aaa; border-radius: 16px; overflow: hidden;">` +
            data.meta.html +
            `</div>` +
            `</a>`
          )
        } else {
          return (
            `<a href="${data.link}" target="_blank" rel="noopener noreferrer">` +
            `<div style="border: solid 1px #aaa; border-radius: 12px; padding: 1.5rem;">` +
            (data.meta.title ? `<h4>${data.meta.title}</h4>` : '') +
            (data.meta.description ? `<p>${data.meta.description}</p>` : '') +
            `</div>` +
            `</a>`
          )
        }
      } else {
        return `<a href="${data.link}" target="_blank" rel="noopener noreferrer">${data.link}</a>`
      }
    },
    image: (data, config) => {
      return `<img src="${data.file.url}" alt="${data.caption}" >`
    },
  }

  const parser = new edjsParser(undefined, customParsers)
  return parser.parse(data)
}
