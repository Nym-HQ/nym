const blockParsers = {
  checkbox: (blocks) => {
    let items = []

    items = blocks.items.map((item) => {
      if (item.checked === true) {
        return `- [x] ${item.text}`
      }
      return `- [ ] ${item.text}`
    })

    return items.join('\n')
  },

  code: (blocks) => {
    return `\`\`\`\n${blocks.code}\n\`\`\`\n`
  },

  delimiter: (_blocks) => {
    const delimiter = '---'

    return delimiter.concat('\n')
  },

  header: (blocks) => {
    switch (blocks.level) {
      case 1:
        return `# ${blocks.text}\n`
      case 2:
        return `## ${blocks.text}\n`
      case 3:
        return `### ${blocks.text}\n`
      case 4:
        return `#### ${blocks.text}\n`
      case 5:
        return `##### ${blocks.text}\n`
      case 6:
        return `###### ${blocks.text}\n`
      default:
        break
    }
  },

  image: (blocks) => {
    return `![${blocks.caption}](${blocks.url} "${blocks.caption}")`.concat(
      '\n'
    )
  },

  list: (blocks) => {
    let items = {}
    switch (blocks.style) {
      case 'unordered':
        items = blocks.items.map((item) => `* ${item}`)

        return items
      case 'ordered':
        items = blocks.items.map((item, index) => `${index + 1} ${item}`)

        return items
      default:
        break
    }
  },

  paragraph: (blocks) => {
    return `${blocks.text}\n`
  },

  quote: (blocks) => {
    return `> ${blocks.text}\n`
  },

  linkTool: (blocks) => {
    return `[${blocks.link}](${blocks.link})\n`
  },
}

/**
 * Markdown Parsing class
 */
export default function parseEditorJsDataIntoMarkdown(data) {
  const parsedData = data.blocks.map((item) => {
    if (blockParsers[item.type]) {
      return blockParsers[item.type](item.data)
    }
    return ''
  })

  return parsedData.filter((v) => !!v).join('')
}
