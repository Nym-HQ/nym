import { NextPageContext } from 'next'
import * as React from 'react'

function CreateYourWebsitePage() {
  return <div></div>
}

export default CreateYourWebsitePage

export async function getServerSideProps(ctx: NextPageContext) {
  return {
    redirect: {
      destination: `/create-site`,
      permanent: true,
    },
  }
}
