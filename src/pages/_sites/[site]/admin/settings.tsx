/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */
import Link from 'next/link'
import { GetServerSideProps } from 'next/types'
import * as React from 'react'
import toast from 'react-hot-toast'
import { BiInfoCircle } from 'react-icons/bi'

import {
  Label,
  Subsection,
  SubsectionSplitter,
} from '~/components/admin-components'
import Button, { DeleteButton, PrimaryButton } from '~/components/Button'
import { Dropzone } from '~/components/Dropzone'
import {
  GitHubIcon,
  GlobeIcon,
  LightBulbWithElectricIcon,
  TwitterIcon,
  YouTubeIcon,
} from '~/components/Icon'
import { Input, Select, Textarea } from '~/components/Input'
import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { Tooltip } from '~/components/Tooltip'
import { getContext } from '~/graphql/context'
import { GET_SITE_SETTINGS } from '~/graphql/queries/site'
import {
  useContextQuery,
  useEditSiteMutation,
  useGetSiteSettingsQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import {
  newsletterProviderDetails,
  newsletterProviders,
} from '~/lib/newsletter/consts'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function AdminSettingsPage(props) {
  const { data: siteSettingsData } = useGetSiteSettingsQuery()
  const { data: contextData } = useContextQuery()
  const context = contextData?.context
  const site = siteSettingsData?.siteSettings

  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  const [values, setValues] = React.useState({
    name: '',
    description: '',
    logo: '',
    attach_css: '',
    attach_js: '',
    social_twitter: '',
    social_youtube: '',
    social_github: '',
    social_other1: '',
    social_other1_label: '',
    ...(site || {}),
    newsletter_provider: site?.newsletter_provider || '',
    newsletter_description: site?.newsletter_description || '',
    newsletter_from_email: site?.newsletter_from_email || '',
    newsletter_double_optin: site?.newsletter_double_optin,
    newsletter_setting1: site?.newsletter_setting1 || '',
    newsletter_setting2: site?.newsletter_setting2 || '',
    newsletter_setting3: site?.newsletter_setting3 || '',
    chatbot: {
      prompt_template: site?.chatbot?.prompt_template || '',
      openai_key: site?.chatbot?.openai_key || '',
    },
    community_site: site?.community_site || '',
  })

  const [showSocialOther1, setShowSocialOther1] = React.useState(
    !!site?.social_other1
  )
  const [isChatbotTraining, setChatbotTraining] = React.useState(false)

  const [editSite, { loading: saving }] = useEditSiteMutation({
    onCompleted({ editSite }) {
      toast.success('Saved site settings!')
    },
  })

  const saveSettings = () => {
    return editSite({
      variables: {
        subdomain: site?.subdomain,
        data: {
          name: values.name,
          description: values.description,
          attach_css: values.attach_css,
          attach_js: values.attach_js,
          banner: values.banner,
          logo: values.logo,
          newsletter_provider: values.newsletter_provider,
          newsletter_description: values.newsletter_description,
          newsletter_from_email: values.newsletter_from_email,
          newsletter_double_optin: values.newsletter_double_optin,
          newsletter_setting1: values.newsletter_setting1,
          newsletter_setting2: values.newsletter_setting2,
          newsletter_setting3: values.newsletter_setting3,
          social_github: values.social_github,
          social_twitter: values.social_twitter,
          social_youtube: values.social_youtube,
          social_other1: values.social_other1,
          social_other1_label: values.social_other1_label,
          community_site: values.community_site,
        },
        chatbot: {
          prompt_template: values.chatbot?.prompt_template || '',
          openai_key: values.chatbot?.openai_key || '',
        },
      },
    })
  }

  const trainChatbot = async () => {
    setChatbotTraining(true)
    await fetch('/api/chatbot/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: '{}',
    })
      .then(
        (r) => toast.success('Chatbot has been trained successfully!'),
        (err) => toast.error('Failed to train your chatbot! Please try again.')
      )
      .finally(() => setChatbotTraining(false))
  }

  const renderGeneralSettings = () => {
    return (
      <Subsection title="General Settings">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-4 sm:col-span-4">
            <Label htmlFor="site-name">Site name</Label>
            <Input
              type="text"
              name="site-name"
              id="site-name"
              autoComplete="disabled"
              value={values.name || ''}
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
              value={values.description || ''}
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
        </div>
      </Subsection>
    )
  }

  const renderAppearanceConfig = () => {
    return (
      <Subsection title="Appearances">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-6">
            <Label>Logo</Label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
              <Dropzone
                site={context?.site}
                upload_options={{
                  use_filename: 'false',
                  public_id: 'site_logo',
                  transformation: 'h_150,w_150,c_fit',
                }}
                onUploadStarted={() => {}}
                onUploadFailed={() => {}}
                onUploadComplete={(url) => {
                  setValues({ ...values, logo: url })
                }}
              >
                <div className="space-y-1 text-center">
                  {values.logo ? (
                    <img
                      src={values.logo}
                      className="mx-auto"
                      style={{ maxHeight: '150px', maxWidth: '150px' }}
                    />
                  ) : (
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
                  )}

                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">Drag and drop a image file</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </Dropzone>
            </div>
          </div>

          {/* <div className="col-span-6">
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
      </div> */}
          <div className="col-span-6">
            <Label htmlFor="css-customization">
              CSS Customization
              <Tooltip content="Use this with caution!">
                <span className="relative ml-1 inline-block">
                  <BiInfoCircle />
                </span>
              </Tooltip>
            </Label>
            <Textarea
              id="css-customization"
              name="css-customization"
              rows={4}
              value={values.attach_css || ''}
              onChange={(e) =>
                setValues({ ...values, attach_css: e.target.value })
              }
            />
          </div>
          <div className="col-span-6">
            <Label htmlFor="javascript-snippets">
              Javascript Snippets
              <Tooltip content="Use this with caution!">
                <span className="relative ml-1 inline-block">
                  <BiInfoCircle />
                </span>
              </Tooltip>
            </Label>
            <Textarea
              id="javascript-snippets"
              name="javascript-snippets"
              rows={4}
              value={values.attach_js || ''}
              onChange={(e) =>
                setValues({ ...values, attach_js: e.target.value })
              }
            />
          </div>
        </div>
      </Subsection>
    )
  }

  const renderSocialLinksConfig = () => {
    return (
      <Subsection title="Online">
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
              value={values.social_twitter || ''}
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
              value={values.social_youtube || ''}
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
              value={values.social_github || ''}
              onChange={(e) =>
                setValues({ ...values, social_github: e.target.value })
              }
            />
          </div>
          <div className="hidden sm:block sm:col-span-1"></div>

          {!showSocialOther1 && (
            <>
              <div className="col-span-1">&nbsp;</div>
              <div className="col-span-4 text-center">
                <PrimaryButton
                  addclassname="w-full"
                  onClick={() => setShowSocialOther1(true)}
                >
                  Add a Link
                </PrimaryButton>
              </div>
            </>
          )}
          {showSocialOther1 && (
            <>
              <div className="col-span-1 sm:col-span-1 text-center">
                <div className="inline-block">
                  <GlobeIcon width={36} height={36} fill="#FFFFFF" />
                </div>
              </div>
              <div className="col-span-5 sm:col-span-4">
                <div className="w-full mb-1">
                  <Label className="sr-only" htmlFor="social-profile-other1">
                    URL of the link
                  </Label>
                  <Input
                    type="text"
                    name="social-profile-other1"
                    id="social-profile-other1"
                    autoComplete="disabled"
                    placeholder="https://abc.xyz"
                    value={values.social_other1 || ''}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        social_other1: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full flex">
                  <Label
                    className="sr-only"
                    htmlFor="social-profile-other1-label"
                  >
                    Name of the link
                  </Label>
                  <Input
                    type="text"
                    name="social-profile-other1-label"
                    id="social-profile-other1-label"
                    autoComplete="disabled"
                    placeholder="Name of the link"
                    value={values.social_other1_label || ''}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        social_other1_label: e.target.value,
                      })
                    }
                  />
                  <DeleteButton
                    addclassname="ml-1"
                    onClick={() => {
                      setValues({
                        ...values,
                        social_other1: '',
                        social_other1_label: '',
                      })
                      setShowSocialOther1(false)
                    }}
                  >
                    Remove
                  </DeleteButton>
                </div>
              </div>
              <div className="hidden sm:block sm:col-span-1"></div>
            </>
          )}
        </div>
      </Subsection>
    )
  }

  const renderNewsletterProviderConfig = ({ newsletter_provider }) => {
    const provider = newsletterProviders.includes(newsletter_provider)
      ? newsletterProviderDetails[newsletter_provider]
      : null

    return (
      <>
        <Subsection title="Community Site Setting">
          <div className="flex items-center">
            <Checkbox
              id="community-site-checkbox"
              name="community-site-checkbox"
              checked={values.community_site}
              onChange={(e) =>
                setValues({
                  ...values,
                  community_site: e.target.checked,
                })
              }
            />
            <Label htmlFor="community-site-checkbox" className="ml-2">
              Enable Community Site
            </Label>
          </div>
        </Subsection>

        <Subsection title="Email newsletter settings">
          {!context.owner?.hasEmail && (
            <p className="text-red-500 text-sm ml-1 mt-1 font-medium">
              The email address of the site owner is not set.{' '}
              {context.userSite?.siteRole === 'OWNER' ? (
                <>
                  Please set it in{' '}
                  <Link className="underline text-sky-500" href="/profile">
                    this page
                  </Link>
                  .
                </>
              ) : (
                <>Please contact the site owner!</>
              )}
            </p>
          )}

          <div className="mt-10 sm:mt-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-5">
                  <Label htmlFor="newsletter_description">
                    Describe your newletter
                  </Label>
                  <Textarea
                    id="newsletter_description"
                    rows={3}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        newsletter_description: e.target.value,
                      })
                    }
                    value={values.newsletter_description}
                  />
                </div>
                <div className="col-span-5">
                  <Label htmlFor="newsletter_provider">
                    Newsletter Provider
                  </Label>
                  <Select
                    id="newsletter_provider"
                    onChange={(e) =>
                      setValues({
                        ...values,
                        newsletter_provider: e.target.value,
                      })
                    }
                    value={values.newsletter_provider}
                  >
                    <option disabled value="">
                      Select a provider
                    </option>
                    {newsletterProviders.map((p) => (
                      <option key={p} value={p}>
                        {newsletterProviderDetails[p].name}
                      </option>
                    ))}
                  </Select>
                  {provider && (
                    <div className="flex pl-2 mt-2 text-gray-700 dark:text-gray-300">
                      <LightBulbWithElectricIcon
                        width={18}
                        height={18}
                        className="flex-shrink-0"
                      />
                      <p className="text-sm ml-1 mt-1 font-medium">
                        {provider.help_text && provider.help_text}
                      </p>
                    </div>
                  )}
                </div>
                <div className="col-span-5">
                  <Label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setValues({
                          ...values,
                          newsletter_double_optin: e.target.checked,
                        })
                      }
                      defaultChecked={values.newsletter_double_optin}
                      className="relative top-1 h-4 w-4 rounded border border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-primary">
                      Uses double opt-in for the subscribers
                    </span>
                  </Label>
                  <div className="flex pl-2 mt-2 text-gray-700 dark:text-gray-300">
                    <LightBulbWithElectricIcon
                      width={18}
                      height={18}
                      className="flex-shrink-0"
                    />
                    <p className="text-sm ml-1 mt-1 font-medium">
                      Double opt-in means that the user has to confirm their
                      subscription (a confirmation email will be sent).
                    </p>
                  </div>
                </div>

                {provider && (
                  <div className="col-span-6 sm:col-span-5">
                    <Label htmlFor="newsletter_from_email">From Email</Label>
                    <Input
                      type="text"
                      name="newsletter_from_email"
                      id="newsletter_from_email"
                      autoComplete="disabled"
                      value={values.newsletter_from_email}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          newsletter_from_email: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {provider && provider.setting1 && (
                  <div className="col-span-6 sm:col-span-5">
                    <Label htmlFor="newsletter_setting1">
                      {provider.setting1}
                    </Label>
                    <Input
                      type="text"
                      name="newsletter_setting1"
                      id="newsletter_setting1"
                      autoComplete="disabled"
                      value={values.newsletter_setting1}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          newsletter_setting1: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {provider && provider.setting2 && (
                  <div className="col-span-6 sm:col-span-5">
                    <Label htmlFor="newsletter_setting2">
                      {provider.setting2}
                    </Label>
                    <Input
                      type="text"
                      name="newsletter_setting2"
                      id="newsletter_setting2"
                      autoComplete="disabled"
                      value={values.newsletter_setting2}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          newsletter_setting2: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {provider && provider.setting3 && (
                  <div className="col-span-6 sm:col-span-5">
                    <Label htmlFor="newsletter_setting3">
                      {provider.setting3}
                    </Label>
                    <Input
                      type="text"
                      name="newsletter_setting3"
                      id="newsletter_setting3"
                      autoComplete="disabled"
                      value={values.newsletter_setting3}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          newsletter_setting3: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Subsection>
      </>
    )
  }

  const renderChatBotConfig = () => {
    return (
      <Subsection title="Chat Bot settings">
        <div className="mt-10 sm:mt-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-5">
                <Label htmlFor="openai_key">OpenAI API Key</Label>
                <Input
                  type="text"
                  name="openai_key"
                  id="openai_key"
                  autoComplete="disabled"
                  value={values.chatbot.openai_key}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      chatbot: {
                        ...values.chatbot,
                        openai_key: e.target.value,
                      },
                    })
                  }
                />
              </div>
              {/* <div className="col-span-5">
                <Label htmlFor="newsletter_description">Prompt Template</Label>
                <Textarea
                  id="prompt_template"
                  rows={3}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      chatbot: {
                        ...values.chatbot,
                        prompt_template: e.target.value,
                      },
                    })
                  }
                  value={values.chatbot.prompt_template}
                />
              </div> */}
              <div className="col-span-5">
                <Button onClick={trainChatbot} disabled={isChatbotTraining}>
                  {isChatbotTraining && <LoadingSpinner />} Train
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Subsection>
    )
  }

  return (
    <Detail.Container ref={scrollContainerRef}>
      <TitleBar
        title="Site Settings"
        backButton
        globalMenu={false}
        backButtonHref={'/'}
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title ref={titleRef}>Site Settings</Detail.Title>

        {renderGeneralSettings()}

        <SubsectionSplitter />

        {renderAppearanceConfig()}

        <SubsectionSplitter />

        {renderSocialLinksConfig()}

        <SubsectionSplitter />

        {renderNewsletterProviderConfig({
          newsletter_provider: values.newsletter_provider,
        })}

        <SubsectionSplitter />

        {context.userSite?.siteRole === 'OWNER' && renderChatBotConfig()}

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)

  // require login
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // require to be admin
  if (!context.viewer.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_SITE_SETTINGS }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
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
