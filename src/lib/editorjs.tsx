import edjsParser from '@herii/editorjs-parser'

export const parseEditorJsDataIntoHtml = (data: any) => {
  const customParsers = {
    customBlock: (data, config) => {
      // parsing functionality
      // the config arg is user provided config merged with default config
    },
    linkTool: (data, config) => {
      if (data.meta) {
        if (data.meta.html) {
          return `<div style="margin-top: 1rem; margin-bottom: 1rem; border: solid 1px #aaa; border-radius: 16px; overflow: hidden;">${data.meta.html}</div>`
        } else {
          return `<a href="${data.link}" target="_blank" rel="noopener noreferrer"><div style="border: solid 1px #aaa; border-radius: 12px; padding: 1.5rem;">${
            data.meta.title ? `<h4>${data.meta.title}</h4>` : ''
          }${
            data.meta.description ? `<p>${data.meta.description}</p>` : ''
          }</div></a>`
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
