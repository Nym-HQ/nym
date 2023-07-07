import { GetServerSideProps } from 'next/types'
import * as React from 'react'

function CreateYourWebsitePage() {
  return <div></div>
}

export default CreateYourWebsitePage

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    redirect: {
      destination: `/create-site`,
      permanent: true,
    },
  }
}
