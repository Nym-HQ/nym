import * as React from 'react'

function Label({ children, ...props }) {
  return (
    <label
      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </label>
  )
}

function Subsection({ title, children = null }) {
  return (
    <section className="mt-4 shadow sm:rounded-md">
      <h3 className="text-lg font-large font-bold mb-2 text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      {children}
    </section>
  )
}

function SubsectionSplitter() {
  return (
    <div className="hidden sm:block" aria-hidden="true">
      <div className="py-5">
        <div className="border-t border-gray-200" />
      </div>
    </div>
  )
}

export { Label, Subsection, SubsectionSplitter }
