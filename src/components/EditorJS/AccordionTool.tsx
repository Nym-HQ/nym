/**
 * Accordion / Toggle block for EditorJS.
 *
 * Each block is one collapsible section: an uppercase title row (with a caret
 * and divider, cef.im/Ahmed-Dahbi style) that expands to reveal a markdown body.
 * Renders as a native <details>/<summary> so it collapses with zero client JS
 * and works in read-only mode (published pages). Authoring uses a title field
 * and a markdown body field; the body is converted to safe HTML on render.
 *
 * Styling lives in src/styles/editor-js.scss (.accordion-block*).
 */

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      (({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }) as Record<string, string>)[c]
  )
}

/** Inline markdown on already-escaped text: links, bold, italic, inline code. */
function mdInline(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
      const safe = /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : '#'
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${text}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/** Minimal markdown → HTML for accordion bodies (paragraphs + unordered lists). */
function mdToHtml(md: string): string {
  if (!md) return ''
  return md
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n').filter((l) => l.trim() !== '')
      if (lines.length && lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        return (
          '<ul>' +
          lines
            .map(
              (l) => '<li>' + mdInline(escapeHtml(l.replace(/^\s*[-*]\s+/, ''))) + '</li>'
            )
            .join('') +
          '</ul>'
        )
      }
      return '<p>' + lines.map((l) => mdInline(escapeHtml(l))).join('<br>') + '</p>'
    })
    .join('')
}

export default class AccordionTool {
  api: any
  readOnly: boolean
  _data: { title: string; body: string }
  nodes: any

  static get toolbox() {
    return {
      title: 'Toggle',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    }
  }

  static get isReadOnlySupported() {
    return true
  }

  static get enableLineBreaks() {
    return true
  }

  static get sanitize() {
    return { title: false, body: false }
  }

  constructor({ data, api, readOnly }: any) {
    this.api = api
    this.readOnly = readOnly
    this.nodes = { titleInput: null, bodyInput: null }
    this._data = {
      title: (data && data.title) || '',
      body: (data && data.body) || '',
    }
  }

  make(tag: string, classNames: string | string[] | null = null, attrs: any = {}) {
    const el: any = document.createElement(tag)
    if (Array.isArray(classNames)) el.classList.add(...classNames)
    else if (classNames) el.classList.add(classNames)
    for (const k in attrs) el[k] = attrs[k]
    return el
  }

  render() {
    if (this.readOnly) return this.renderView()
    return this.renderEditor()
  }

  renderView() {
    const details = this.make('details', 'accordion-block')
    try {
      const summary = this.make('summary', 'accordion-block__summary')
      summary.textContent = this._data.title || 'Untitled'
      const body = this.make('div', 'accordion-block__body')
      body.innerHTML = mdToHtml(this._data.body)
      details.appendChild(summary)
      details.appendChild(body)
    } catch (e) {
      // Never let a bad accordion block break rendering of the whole page.
      details.textContent = this._data.title || ''
    }
    return details
  }

  renderEditor() {
    const wrapper = this.make('div', 'accordion-block-editor')

    this.nodes.titleInput = this.make(
      'div',
      [this.api.styles.input, 'accordion-block-editor__title'],
      { contentEditable: true }
    )
    this.nodes.titleInput.dataset.placeholder = 'Section title (e.g. ABOUT)'
    this.nodes.titleInput.textContent = this._data.title

    this.nodes.bodyInput = this.make(
      'div',
      [this.api.styles.input, 'accordion-block-editor__body'],
      { contentEditable: true }
    )
    this.nodes.bodyInput.dataset.placeholder = 'Body — markdown supported (links, **bold**, - lists)'
    this.nodes.bodyInput.textContent = this._data.body

    wrapper.appendChild(this.nodes.titleInput)
    wrapper.appendChild(this.nodes.bodyInput)
    return wrapper
  }

  save() {
    try {
      if (this.nodes.titleInput) {
        this._data = {
          title: (this.nodes.titleInput.textContent || '').trim(),
          // innerText preserves the line breaks a contentEditable div creates.
          body: this.nodes.bodyInput?.innerText ?? this._data.body,
        }
      }
    } catch (e) {
      // Never reject the whole page save because of one accordion block.
    }
    return this._data
  }
}
