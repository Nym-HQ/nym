'use client'

import CheckList from '@editorjs/checklist'
import Code from '@editorjs/code'
import Delimiter from '@editorjs/delimiter'
import EditorJS, { ToolConstructable, ToolSettings } from '@editorjs/editorjs'
import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import InlineCode from '@editorjs/inline-code'
import LinkTool from '@editorjs/link'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import NestedList from '@editorjs/nested-list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Raw from '@editorjs/raw'
import SimpleImage from '@editorjs/simple-image'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import debounce from 'lodash/debounce'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { Cloudinary, uploadFile } from '../Dropzone/uploadUtils'
import AnyButton from './AnyButtonTool'
import { CustomLinkTool } from './CustomLinkTool'
import HeaderExtended from './Header'
import SubscribeButtonTool from './SubscribeButtonTool'

const DEFAULT_EDITOR_JS_TOOLS = {
  // NOTE: Paragraph is default tool. Declare only when you want to change paragraph option.
  // paragraph: Paragraph,
  embed: Embed,
  table: Table,
  list: List,
  // !TODO: Replace @editorjs/list with @editorjs/nested-list,
  //        But we should wait for [the PR](https://github.com/editor-js/nested-list/pull/39) to be merged.
  //        Otherwise, the nested list is not compatible with the old list.
  // list: {
  //   class: NestedList,
  //   inlineToolbar: true,
  //   config: {
  //     defaultStyle: 'unordered'
  //   },
  // },
  warning: Warning,
  code: Code,
  linkTool: LinkTool,
  image: Image,
  raw: Raw,
  header: HeaderExtended as typeof Header,
  quote: Quote,
  marker: Marker,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  simpleImage: SimpleImage,
  AnyButton: AnyButton,
}

export default function CustomizedEditorJS({
  id, //required
  value,
  readOnly = false,
  editorRef = (el) => {},
  onChange = (data) => {},
  site,
  ...props
}) {
  const editorContainer = useRef<HTMLDivElement>()
  const editorCore = useRef<EditorJS>(null)
  const editorData = useRef<string>(JSON.stringify(value))

  const handleUploadByFile = useCallback(
    async (file) => {
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
    [site, props.upload_options]
  )

  const EDITOR_JS_TOOLS = useMemo(() => {
    return {
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
            uploadByFile: handleUploadByFile,

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
      subscribe: SubscribeButtonTool,
    }
  }, [handleUploadByFile])

  const handleSave = useCallback(
    debounce(async () => {
      if (!editorCore.current || editorCore.current.readOnly?.isEnabled)
        return false

      const savedData = await editorCore.current.save()
      editorData.current = JSON.stringify(savedData)
      onChange(savedData)
    }, 200),
    [editorCore, onChange]
  )

  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!editorCore.current) {
      if (!editorContainer.current) return

      console.log('Creating a new editorjs instance')
      editorCore.current = new EditorJS({
        holder: editorContainer.current,
        tools: EDITOR_JS_TOOLS as any as {
          [toolName: string]: ToolConstructable | ToolSettings
        },
        data: value,
        readOnly: readOnly,
        onChange: handleSave,
      })
    }

    //add a return function handle cleanup
    return () => {
      if (editorCore.current) {
        if (editorCore.current.destroy) editorCore.current.destroy()
        editorCore.current = null
        console.log('Destroyed editorjs instance')
      }
    }
  }, [editorContainer.current, EDITOR_JS_TOOLS, handleSave])

  useEffect(() => {
    if (!editorCore.current) return

    console.log('toggling readonly state of the editorjs', readOnly)
    editorCore.current.readOnly?.toggle(readOnly)
  }, [editorCore.current, readOnly])

  useEffect(() => {
    editorRef(editorCore.current)
  }, [editorCore.current])

  useEffect(() => {
    if (
      editorCore.current &&
      editorCore.current.render &&
      editorData.current != JSON.stringify(value)
    ) {
      try {
        console.log('rendering editorjs with value', value)
        editorCore.current.render(value || { blocks: [] })
      } catch {
        // swallow error
      }
    }
  }, [editorCore.current, value])

  return <div id={id} ref={editorContainer} />
}
