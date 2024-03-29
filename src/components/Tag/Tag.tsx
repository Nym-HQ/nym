import * as React from 'react'
import { PlusCircle, XCircle } from 'react-feather'

export default function Tag({ name, icon = undefined, onClick = (e) => {} }) {
  const baseClasses =
    'flex-none justify-center flex items-center space-x-2 cursor-pointer self-start border uppercase rounded-full hover:bg-opacity-10 dark:hover:bg-opacity-30 px-3 py-0.5 text-xs font-semibold leading-5 tracking-wide border-opacity-50 dark:border-opacity-10'

  let specificClasses = ''
  if (name) {
    switch (name?.toLowerCase()) {
      case 'indie': {
        specificClasses =
          'border-purple-200 text-purple-600 dark:text-purple-300 bg-purple-500 bg-opacity-5 dark:bg-opacity-10'
        break
      }
      case 'open source': {
        specificClasses =
          'border-green-200 text-green-600 dark:text-green-200  bg-green-500 bg-opacity-5 dark:bg-opacity-10'
        break
      }
      case 'portfolio': {
        specificClasses =
          'border-blue-200 text-blue-600 dark:text-blue-200 bg-blue-500 bg-opacity-5 dark:bg-opacity-10'
        break
      }
      case 'website': {
        specificClasses =
          'border-red-200 text-red-600 dark:text-red-200 bg-red-500 bg-opacity-5 dark:bg-opacity-10'
        break
      }
      case 'reading': {
        specificClasses =
          'border-gray-200 text-gray-600 dark:text-gray-300 bg-gray-200 bg-opacity-30 dark:bg-opacity-10 hover:bg-opacity-40'
        break
      }
      case '__clear_tag_picker': {
        specificClasses =
          'border-gray-200 text-gray-600 dark:text-gray-300 bg-gray-200 bg-opacity-30 dark:bg-opacity-10 hover:bg-opacity-40'
        break
      }
      case '__new_tag_picker': {
        specificClasses =
          'border-gray-200 text-gray-600 dark:text-gray-300 bg-gray-200 bg-opacity-30 dark:bg-opacity-10 hover:bg-opacity-40'
        break
      }
      default: {
        specificClasses =
          'border-yellow-200 text-yellow-600 dark:text-yellow-200 bg-yellow-500 bg-opacity-5 dark:bg-opacity-10'
      }
    }
  }
  return (
    <span
      className={`${baseClasses} ${specificClasses}`}
      onClick={(e) => onClick(e)}
    >
      {name === '__clear_tag_picker' ? (
        <>
          <XCircle size={16} />
          <span>Clear tag</span>
        </>
      ) : name === '__new_tag_picker' ? (
        <>
          <PlusCircle size={16} />
          <span>Add New Tag</span>
        </>
      ) : (
        <>
          {icon}
          {name}
        </>
      )}
    </span>
  )
}
