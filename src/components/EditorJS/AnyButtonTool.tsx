export default class AnyButton {
  readOnly: boolean
  nodes: any
  _data: { text: string; link: string }
  api: any
  CSS: { [key: string]: string }

  /**
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      title: 'Button',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" enable-background="new 0 0 512 512" height="20" viewBox="0 0 512 512" width="20"><path d="m237.102 366v-90.018h-90c-11.046 0-20-8.954-20-20s8.954-20 20-20h90v-90.982c0-11.046 8.954-20 20-20s20 8.954 20 20v90.982h90c11.046 0 20 8.954 20 20s-8.954 20-20 20h-90v90.018c0 11.046-8.954 20-20 20s-20-8.954-20-20zm254.898-15c11.046 0 20-8.954 20-20v-251c0-44.112-35.888-80-80-80h-352c-44.112 0-80 35.888-80 80v352c0 44.112 35.888 80 80 80h352c44.112 0 80-35.888 80-80 0-11.046-8.954-20-20-20s-20 8.954-20 20c0 22.056-17.944 40-40 40h-352c-22.056 0-40-17.944-40-40v-352c0-22.056 17.944-40 40-40h352c22.056 0 40 17.944 40 40v251c0 11.046 8.954 20 20 20z"/></svg>',
    }
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @return {boolean}
   */
  static get isReadOnlySupported() {
    return true
  }
  /**
   *
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return false
  }

  /**
   *
   * @returns {{EDIT: number, VIEW: number}}
   * @constructor
   */
  static get STATE() {
    return {
      EDIT: 0,
      VIEW: 1,
    }
  }
  /**
   *
   * @param data
   */
  set data(data) {
    this._data = Object.assign(
      {},
      {
        link: this.api.sanitizer.clean(data.link || '', AnyButton.sanitize),
        text: this.api.sanitizer.clean(data.text || '', AnyButton.sanitize),
      }
    )
  }
  /**
   *
   * @returns {{text: string, link: string}}
   */
  get data() {
    return this._data
  }

  /**
   * セーブ時のバリデーション
   * @param savedData
   * @returns {boolean}
   */
  validate(savedData) {
    if (this._data.link === '' || this._data.text === '') {
      return false
    }

    return true
  }
  /**
   *
   * @param block
   * @returns {{caption: string, text: string, alignment: string}}
   */
  save(block) {
    return this._data
  }

  /**
   * タグを全部削除する
   * @returns {{link: boolean, text: boolean}}
   */
  static get sanitize() {
    return {
      text: false,
      link: false,
    }
  }

  /**
   *
   * @param data
   * @param config
   * @param api
   * @param readOnly
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api
    this.readOnly = readOnly

    this.nodes = {
      wrapper: null,
      container: null,
      inputHolder: null,
      toggleHolder: null,
      anyButtonHolder: null,
      textInput: null,
      linkInput: null,
      registButton: null,
      anyButton: null,
    }
    //css overwrite
    const _CSS = {
      baseClass: this.api.styles.block,
      hide: 'hide',
      btn: 'btn',
      container: 'anyButtonContainer',
      input: 'anyButtonContainer__input',

      inputHolder: 'anyButtonContainer__inputHolder',
      inputText: 'anyButtonContainer__input--text',
      inputLink: 'anyButtonContainer__input--link',
      registButton: 'anyButtonContainer__registerButton',
      anyButtonHolder: 'anyButtonContainer__anyButtonHolder',
      btnColor: 'btn--default',
      toggleSwitch: 'toggle-switch',
      toggleInput: 'toggle-input',
      toggleLabel: 'toggle-label',
    }

    this.CSS = Object.assign(_CSS, config.css)

    this.data = {
      link: '',
      text: '',
    }
    this.data = data
  }

  render() {
    this.nodes.wrapper = this.make('div', this.CSS.baseClass)
    this.nodes.container = this.make('div', this.CSS.container) //twitter-embed-tool

    //入力用
    this.nodes.inputHolder = this.makeInputHolder()
    this.nodes.container.appendChild(this.nodes.inputHolder)

    //toggle
    if (!this.readOnly) {
      this.nodes.toggleHolder = this.makeToggle()
      this.nodes.container.appendChild(this.nodes.toggleHolder)
    }

    //display button
    this.nodes.anyButtonHolder = this.makeAnyButtonHolder()
    this.nodes.container.appendChild(this.nodes.anyButtonHolder)

    if (this._data.link !== '' || this.readOnly) {
      this.init()
      this.show(AnyButton.STATE.VIEW)
    }

    this.nodes.wrapper.appendChild(this.nodes.container)

    return this.nodes.wrapper
  }

  makeInputHolder() {
    const inputHolder = this.make('div', [this.CSS.inputHolder])
    this.nodes.textInput = this.make(
      'div',
      [this.api.styles.input, this.CSS.input, this.CSS.inputText],
      {
        contentEditable: !this.readOnly,
      }
    )
    this.nodes.textInput.dataset.placeholder = this.api.i18n.t('Button Text')

    this.nodes.linkInput = this.make(
      'div',
      [this.api.styles.input, this.CSS.input, this.CSS.inputLink],
      {
        contentEditable: !this.readOnly,
      }
    )
    this.nodes.linkInput.dataset.placeholder = this.api.i18n.t('Link Url')

    this.nodes.registButton = this.make('button', [
      this.api.styles.button,
      this.CSS.registButton,
    ])
    this.nodes.registButton.type = 'button'
    this.nodes.registButton.textContent = this.api.i18n.t('Set')

    this.nodes.registButton.addEventListener('click', (event) => {
      this.data = {
        link: this.nodes.linkInput.textContent,
        text: this.nodes.textInput.textContent,
      }
      this.show(AnyButton.STATE.VIEW)
    })

    inputHolder.appendChild(this.nodes.textInput)
    inputHolder.appendChild(this.nodes.linkInput)
    inputHolder.appendChild(this.nodes.registButton)

    return inputHolder
  }

  init() {
    this.nodes.textInput.textContent = this._data.text
    this.nodes.linkInput.textContent = this._data.link
  }

  show(state) {
    this.nodes.anyButton.textContent = this._data.text
    this.nodes.anyButton.setAttribute('href', this._data.link)
    this.changeState(state)
  }

  makeAnyButtonHolder() {
    const anyButtonHolder = this.make('div', [
      this.CSS.hide,
      this.CSS.anyButtonHolder,
    ])
    this.nodes.anyButton = this.make('a', [this.CSS.btn, this.CSS.btnColor], {
      target: '_blank',
      rel: 'nofollow noindex noreferrer',
    })
    this.nodes.anyButton.textContent = this.api.i18n.t('Default Button')
    anyButtonHolder.appendChild(this.nodes.anyButton)
    return anyButtonHolder
  }

  changeState(state) {
    switch (state) {
      case AnyButton.STATE.EDIT:
        this.nodes.inputHolder.classList.remove(this.CSS.hide)
        this.nodes.anyButtonHolder.classList.add(this.CSS.hide)
        if (this.nodes.toggleInput) this.nodes.toggleInput.checked = 0

        break
      case AnyButton.STATE.VIEW:
        this.nodes.inputHolder.classList.add(this.CSS.hide)
        this.nodes.anyButtonHolder.classList.remove(this.CSS.hide)
        if (this.nodes.toggleInput) this.nodes.toggleInput.checked = 1
        break
    }
  }

  makeToggle() {
    /**
     * <div class="toggle-switch">
     * <input id="toggle" class="toggle-input" type='checkbox' />
     * <label for="toggle" class="toggle-label"/>
     * </div>
     **/
    const toggleHolder = this.make('div', [this.CSS.toggleSwitch])
    this.nodes.toggleInput = this.make('input', [this.CSS.toggleInput], {
      type: 'checkbox',
      id: 'toggle',
    })
    const label = this.make('label', [this.CSS.toggleLabel], { for: 'toggle' })

    this.nodes.toggleInput.addEventListener('change', (event) => {
      this.data = {
        link: this.nodes.linkInput.textContent,
        text: this.nodes.textInput.textContent,
      }
      this.show(Number(this.nodes.toggleInput.checked))
    })
    toggleHolder.appendChild(this.nodes.toggleInput)
    toggleHolder.appendChild(label)

    return toggleHolder
  }

  /**
   * node 作成用
   * @param tagName
   * @param classNames
   * @param attributes
   * @returns {*}
   */
  make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName)

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames)
    } else if (classNames) {
      el.classList.add(classNames)
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName]
    }

    return el
  }
}
