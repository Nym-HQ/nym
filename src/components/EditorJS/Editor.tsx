import CheckList from '@editorjs/checklist'
import Code from '@editorjs/code'
import Delimiter from '@editorjs/delimiter'
import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import InlineCode from '@editorjs/inline-code'
import LinkTool from '@editorjs/link'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Raw from '@editorjs/raw'
import SimpleImage from '@editorjs/simple-image'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import AnyButton from 'editorjs-button'
import { debounce } from 'lodash'
import React, { useCallback, useRef } from 'react'
import { createReactEditorJS } from 'react-editor-js'

import { Cloudinary, uploadFile } from '../Dropzone/uploadUtils'
import { CustomLinkTool } from './CustomLinkTool'

const DEFAULT_EDITOR_JS_TOOLS = {
  // NOTE: Paragraph is default tool. Declare only when you want to change paragraph option.
  // paragraph: Paragraph,
  embed: Embed,
  table: Table,
  list: List,
  warning: Warning,
  code: Code,
  linkTool: LinkTool,
  image: Image,
  raw: Raw,
  header: Header,
  quote: Quote,
  marker: Marker,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  simpleImage: SimpleImage,
  AnyButton: AnyButton,
}

export default function CustomizedEditorJS({
  value,
  readOnly = false,
  editorRef = (el) => {},
  onChange = (data) => {},
  site,
  ...props
}) {
  const editorCore = useRef(null)

  const handleInitialize = useCallback((instance) => {
    editorCore.current = instance
    editorRef(instance)
  }, [])

  const handleSave = useCallback(
    debounce(async () => {
      if (editorCore.current === null) return false

      const savedData = await editorCore.current.save()
      onChange(savedData)
    }, 200),
    []
  )

  const EDITOR_JS_TOOLS = {
    ...DEFAULT_EDITOR_JS_TOOLS,
    image: {
      class: Image,
      config: {
        /**
         * Custom uploader
         */
        uploader: {
          /**
           * Upload file to the server and return an uploaded image data
           * @param {File} file - file selected from the device or pasted by drag-n-drop
           * @return {Promise.<{success, file: {url}}>}
           */
          uploadByFile: async (file) => {
            // your own uploading logic here
            try {
              const url = await uploadFile({
                file,
                fileProvider: Cloudinary,
                site: site,
                upload_options: props.upload_options,
              })
              return {
                success: 1,
                file: {
                  url,
                  // any other image data you want to store, such as width, height, color, extension, etc
                },
              }
            } catch (e) {}
          },

          /**
           * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
           * @param {string} url - pasted image URL
           * @return {Promise.<{success, file: {url}}>}
           */
          uploadByUrl: async (url) => {
            // your ajax request for uploading
            return {
              success: 1,
              file: {
                url,
                // any other image data you want to store, such as width, height, color, extension, etc
              },
            }
          },
        },
      },
    },
    embed: {
      class: Embed,
      config: {
        services: {
          facebook: true,
          instagram: true,
          youtube: true,
          twitter: false, // disable twitter service, as we deal with it in linkTool
          'twitch-video': true,
          miro: true,
          vime: true,
          gfycat: true,
          imgur: true,
          vine: true,
          aparat: true,
          'yandex-music-track': true,
          coub: true,
          codepen: true,
          pinterest: true,
        },
      },
    },
    linkTool: {
      class: CustomLinkTool,
      config: {
        endpoint: '/api/link-meta', // endpoint for url data fetching,
      },
    },
  }

  const ReactEditorJS = createReactEditorJS()
  const editorProps = readOnly
    ? { readOnly: true }
    : { readOnly: false, onChange: handleSave }

  return (
    <ReactEditorJS
      onInitialize={handleInitialize}
      defaultValue={value}
      tools={EDITOR_JS_TOOLS as typeof DEFAULT_EDITOR_JS_TOOLS}
      {...editorProps}
    />
  )
}
