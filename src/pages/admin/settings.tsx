/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */
import * as React from 'react'
import toast from 'react-hot-toast'

import {
  Label,
  Subsection,
  SubsectionSplitter,
} from '~/components/admin-components'
import { PrimaryButton } from '~/components/Button'
import { CountrySelector } from '~/components/CountrySelector'
import {
  COUNTRIES,
  SelectMenuOption,
} from '~/components/CountrySelector/countries'
import { GitHubIcon, TwitterIcon, YouTubeIcon } from '~/components/Icon'
import { Input, Select, Textarea } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { getContext } from '~/graphql/context'
import { useContextQuery, useEditSiteMutation } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AdminSettingsPage(props) {
  const { data } = useContextQuery()

  const countrySelectorRef = React.createRef<HTMLDivElement>()
  const [countrySelectorOpen, setCountrySelectorOpen] = React.useState(false)

  const [values, setValues] = React.useState({
    name: '',
    description: '',
    attach_css: '',
    attach_js: '',
    social_twitter: '',
    social_youtube: '',
    social_github: '',
    mailgun_domain: '',
    mailgun_api_key: '',
    ...(data?.context?.site || {}),
    mailgun_region: (data?.context?.site || {}).mailgun_region || 'US',
  })

  const [editSite, { loading: saving }] = useEditSiteMutation({
    onCompleted({ editSite }) {
      toast.success('Saved site settings!')
    },
  })

  const saveSettings = () => {
    return editSite({
      variables: {
        subdomain: data?.context?.site?.subdomain,
        data: {
          name: values.name,
          description: values.description,
          attach_css: values.attach_css,
          attach_js: values.attach_js,
          banner: values.banner,
          logo: values.logo,
          mailgun_api_key: values.mailgun_api_key,
          mailgun_domain: values.mailgun_domain,
          mailgun_region: values.mailgun_region,
          social_github: values.social_github,
          social_twitter: values.social_twitter,
          social_youtube: values.social_youtube,
        },
      },
    })
  }

  return (
    <Detail.Container>
      <TitleBar
        title={values.name}
        backButton
        globalMenu={false}
        backButtonHref={'/admin'}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title>Site Settings</Detail.Title>

        <Subsection title="General Settings">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-4 sm:col-span-4">
              <Label htmlFor="site-name">Site name</Label>
              <Input
                type="text"
                name="site-name"
                id="site-name"
                autoComplete="disabled"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
            </div>
            <div className="col-span-4 sm:col-span-4">
              <Label htmlFor="site-description">Site description</Label>
              <Textarea
                name="site-description"
                rows={4}
                id="site-description"
                autoComplete="disabled"
                value={values.description}
                onChange={(e) =>
                  setValues({ ...values, description: e.target.value })
                }
              />
            </div>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <Subsection title="Appearances">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <Label>Logo</Label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload-logo"
                        name="file-upload-logo"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-6">
              <Label>Banner</Label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload-banner"
                        name="file-upload-banner"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <Label htmlFor="css-customization">CSS Customization</Label>
              <Textarea
                id="css-customization"
                name="css-customization"
                rows={4}
                value={values.attach_css}
                onChange={(e) =>
                  setValues({ ...values, attach_css: e.target.value })
                }
              />
            </div>
            <div className="col-span-6">
              <Label htmlFor="javascript-snippets">Javascript Snippets</Label>
              <Textarea
                id="javascript-snippets"
                name="javascript-snippets"
                rows={4}
                value={values.attach_js}
                onChange={(e) =>
                  setValues({ ...values, attach_js: e.target.value })
                }
              />
            </div>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <Subsection title="Social information">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-1 sm:col-span-1 text-center">
              <div className="inline-block">
                <TwitterIcon width={36} height={36} fill="#1DA1F2" />
              </div>
            </div>
            <div className="col-span-5 sm:col-span-4">
              <Label className="sr-only" htmlFor="social-profile-twitter">
                Twitter
              </Label>
              <Input
                type="text"
                name="social-profile-twitter"
                id="social-profile-twitter"
                autoComplete="disabled"
                placeholder="https://twitter.com/nym_xyz"
                value={values.social_twitter}
                onChange={(e) =>
                  setValues({ ...values, social_twitter: e.target.value })
                }
              />
            </div>
            <div className="hidden sm:block sm:col-span-1"></div>

            <div className="col-span-1 sm:col-span-1 text-center">
              <div className="inline-block">
                <YouTubeIcon width={36} height={36} fill="#FF0000" />
              </div>
            </div>
            <div className="col-span-5 sm:col-span-4">
              <Label className="sr-only" htmlFor="social-profile-youtube">
                Youtube
              </Label>
              <Input
                type="text"
                name="social-profile-youtube"
                id="social-profile-youtube"
                autoComplete="disabled"
                placeholder="https://youtube.com/nym_xyz"
                value={values.social_youtube}
                onChange={(e) =>
                  setValues({ ...values, social_youtube: e.target.value })
                }
              />
            </div>
            <div className="hidden sm:block sm:col-span-1"></div>

            <div className="col-span-1 sm:col-span-1 text-center">
              <div className="inline-block">
                <GitHubIcon width={36} height={36} fill="#FFFFFF" />
              </div>
            </div>
            <div className="col-span-5 sm:col-span-4">
              <Label className="sr-only" htmlFor="social-profile-github">
                Github
              </Label>
              <Input
                type="text"
                name="social-profile-github"
                id="social-profile-github"
                autoComplete="disabled"
                placeholder="https://github.com/Sov-Ventures"
                value={values.social_github}
                onChange={(e) =>
                  setValues({ ...values, social_github: e.target.value })
                }
              />
            </div>
            <div className="hidden sm:block sm:col-span-1"></div>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <Subsection title="Email newsletter settings">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            The Mailgun API is used for bulk email newsletter delivery.
          </p>

          <div className="mt-10 sm:mt-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-2 sm:col-span-2">
                  <Label htmlFor="country">Mailgun region</Label>
                  <CountrySelector
                    id="country"
                    ref={countrySelectorRef}
                    open={countrySelectorOpen}
                    onToggle={() => {
                      setCountrySelectorOpen(!countrySelectorOpen)
                    }}
                    onChange={(e) =>
                      setValues({ ...values, mailgun_region: e })
                    }
                    selectedValue={
                      COUNTRIES.find(
                        (option) => option.value === values.mailgun_region
                      ) as SelectMenuOption
                    }
                  />
                </div>

                <div className="col-span-4 sm:col-span-4">
                  <Label htmlFor="mailgun-domain">Mailgun domain</Label>
                  <Input
                    type="text"
                    name="mailgun-domain"
                    id="mailgun-domain"
                    autoComplete="disabled"
                    value={values.mailgun_domain}
                    onChange={(e) =>
                      setValues({ ...values, mailgun_domain: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Find your Mailgun region and domain.
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <Label htmlFor="mailgun-api-key">Mailgun API Key</Label>
                  <Input
                    type="text"
                    name="mailgun-api-key"
                    id="mailgun-api-key"
                    autoComplete="disabled"
                    value={values.mailgun_api_key}
                    onChange={(e) =>
                      setValues({ ...values, mailgun_api_key: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </Subsection>

        <SubsectionSplitter />

        <div className="px-4 py-3 sm:px-6">
          <PrimaryButton type="submit" onClick={saveSettings} disabled={saving}>
            {saving && <LoadingSpinner />}Save settings
          </PrimaryButton>
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  if (!graphqlData[0]?.data?.context?.viewer?.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

AdminSettingsPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export default AdminSettingsPage
