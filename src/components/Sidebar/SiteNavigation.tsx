import { useRouter } from 'next/router'
import * as React from 'react'
import { Mail, Plus, Settings } from 'react-feather'
import { Users } from 'react-feather'

import { GhostButton } from '~/components/Button'
import {
  AMAIcon,
  BookAtlasIcon,
  BookmarksIcon,
  DomainWwwIcon,
  ExternalLinkIcon,
  GitHubIcon,
  GlobeIcon,
  HomeIcon,
  PageIcon,
  TwitterIcon,
  WritingIcon,
  YouTubeIcon,
} from '~/components/Icon'
import { useContextQuery, useGetPagesQuery } from '~/graphql/types.generated'

import { NavigationLink } from './NavigationLink'

export function SiteSidebarNavigation() {
  const router = useRouter()
  const { data } = useContextQuery()
  const { data: pagesData } = useGetPagesQuery({
    variables: {
      filter: { published: true, featuredOnly: false, includeHomepage: true },
    },
  })

  const AddBookmarkActionBtn = () => {
    return data?.context?.viewer?.isAdmin ? (
      <GhostButton
        aria-label="Add bookmark"
        size="small-square"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          window.dispatchEvent(
            new CustomEvent('custom.action.openAddBookmarkForm')
          )
        }}
      >
        <Plus size={16} />
      </GhostButton>
    ) : null
  }

  const sections = [
    {
      label: null,
      items: [
        /*{
          href: '/',
          label: 'Home',
          icon: HomeIcon,
          trailingAccessory: null,
          isActive: router.asPath === '/',
          trailingAction: null,
          isExternal: false,
        },*/

        {
          href: '/writing',
          label: 'Posts',
          icon: WritingIcon,
          trailingAccessory: null,
          isActive: router.asPath.indexOf('/writing') >= 0,
          trailingAction: null,
          isExternal: false,
        },

        {
          href: '/bookmarks',
          label: 'Links',
          icon: BookmarksIcon,
          trailingAccessory: null,
          isActive: router.asPath.indexOf('/bookmarks') >= 0,
          trailingAction: AddBookmarkActionBtn,
          isExternal: false,
        },

        {
          href: '/qa',
          label: 'Q&A',
          icon: AMAIcon,
          trailingAccessory: null,
          isActive:
            router.asPath.indexOf('/qa') >= 0 &&
            !router.asPath.startsWith('/qa/pending'),
          trailingAction: null,
          isExternal: false,
        },

        {
          href: '/chat',
          label: 'Chat',
          icon: AMAIcon,
          trailingAccessory: null,
          isActive: router.asPath.indexOf('/chat') >= 0,
          trailingAction: null,
          isExternal: false,
        },
      ],
    },
  ]

  // Pages
  const pagesSection = {
    label: 'Pages',
    items: [],
  }

  if (data?.context?.viewer?.isAdmin) {
    pagesSection.items.push({
      href: '/pages',
      label: 'All pages',
      icon: BookAtlasIcon,
      trailingAccessory: null,
      isActive: router.asPath === '/pages',
      trailingAction: null,
      isExternal: false,
    })
  }

  pagesData?.pages
    ?.filter((page) => page && page.featured)
    .forEach((page) => {
      pagesSection.items.push({
        href: page.path,
        label: page.title,
        icon: PageIcon,
        trailingAccessory: null,
        isActive: router.asPath === page.path,
        trailingAction: null,
        isExternal: false,
      })
    })

  if (pagesSection.items.length > 0) sections.push(pagesSection)

  // Social
  const social_items = []
  if (data?.context?.site?.social_twitter) {
    social_items.push({
      href: data?.context?.site?.social_twitter,
      label: 'Twitter',
      icon: TwitterIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }
  if (data?.context?.site?.social_youtube) {
    social_items.push({
      href: data?.context?.site?.social_youtube,
      label: 'Youtube',
      icon: YouTubeIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }
  if (data?.context?.site?.social_github) {
    social_items.push({
      href: data?.context?.site?.social_github,
      label: 'GitHub',
      icon: GitHubIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }
  if (data?.context?.site?.social_other1) {
    social_items.push({
      href: data?.context?.site?.social_other1,
      label: data?.context?.site?.social_other1_label || 'Other',
      icon: GlobeIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }

  if (social_items.length > 0) {
    sections.push({
      label: 'Online',
      items: social_items,
    })
  }

  if (data?.context?.viewer?.isAdmin) {
    sections.push({
      label: 'Admin',
      items: [
        // {
        //   href: '/admin/profile',
        //   label: 'Profile',
        //   icon: StaffDesignIcon,
        //   trailingAccessory: null,
        //   isActive: router.asPath === '/admin/profile',
        //   trailingAction: null,
        //   isExternal: false,
        // },
        {
          href: '/admin/domain-mapping',
          label: 'Domain Mapping',
          icon: DomainWwwIcon,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/domain-mapping',
          trailingAction: null,
          isExternal: false,
        },
        {
          href: '/admin/settings',
          label: 'Site Settings',
          icon: () => <Settings />,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/settings',
          trailingAction: null,
          isExternal: false,
        },
        {
          href: '/admin/members',
          label: 'Members',
          icon: () => <Users />,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/members',
          trailingAction: null,
          isExternal: false,
        },
        {
          href: '/admin/newsletters',
          label: 'Newsletter',
          icon: () => <Mail />,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/newsletters',
          trailingAction: null,
          isExternal: false,
        },
      ],
    })
  }

  return (
    <div className="flex-1 px-3 py-3 space-y-1">
      {sections.map((section, i) => {
        return (
          <ul key={i} className="space-y-1">
            {section.label && (
              <h4
                key={i}
                className="px-2 pt-5 pb-2 text-xs font-semibold text-gray-1000 text-opacity-40 dark:text-white"
              >
                {section.label}
              </h4>
            )}
            {section.items.map((item, j) => (
              <NavigationLink key={j} link={item} site={data?.context?.site} />
            ))}
          </ul>
        )
      })}
    </div>
  )
}
