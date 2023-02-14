import edjsParser from '@herii/editorjs-parser'

export const parseEditorJsDataIntoHtml = (data: any) => {
  const customParsers = {
    customBlock: (data, config) => {
      // parsing functionality
      // the config arg is user provided config merged with default config
    },
    // image: (data, config) => {
    //   return `<img src="${data.file.url}" alt="${data.caption}" >`
    // },
  }

  const parser = new edjsParser(undefined, customParsers)
  return parser.parse(data)
}
