import { useRouter } from 'next/router'
import * as React from 'react'
import { Plus } from 'react-feather'

import { AddBookmarkDialog } from '~/components/Bookmarks/AddBookmarkDialog'
import { GhostButton } from '~/components/Button'
import {
  AMAIcon,
  AppDissectionIcon,
  BookAtlasIcon,
  BookmarksIcon,
  ExternalLinkIcon,
  GitHubIcon,
  GlobeIcon,
  HackerNewsIcon,
  HomeIcon,
  PageIcon,
  StaffDesignIcon,
  TwitterIcon,
  WritingIcon,
  YouTubeIcon,
} from '~/components/Icon'
import {
  useGetPagesQuery,
  useViewerQuery,
  useViewSiteQuery,
} from '~/graphql/types.generated'

import { NavigationLink } from './NavigationLink'

function ThisAddBookmarkDialog() {
  return (
    <AddBookmarkDialog
      trigger={
        <GhostButton aria-label="Add bookmark" size="small-square">
          <Plus size={16} />
        </GhostButton>
      }
    />
  )
}

export function SiteSidebarNavigation() {
  const router = useRouter()
  const { data } = useViewerQuery()
  const { data: siteData } = useViewSiteQuery()
  const { data: pagesData } = useGetPagesQuery({
    variables: { filter: { published: true, featuredOnly: true } },
  })
  const sections = [
    {
      label: null,
      items: [
        {
          href: '/',
          label: 'Home',
          icon: HomeIcon,
          trailingAccessory: null,
          isActive: router.asPath === '/',
          trailingAction: null,
          isExternal: false,
        },

        {
          href: '/writing',
          label: 'Writing',
          icon: WritingIcon,
          trailingAccessory: null,
          isActive: router.asPath.indexOf('/writing') >= 0,
          trailingAction: null,
          isExternal: false,
        },
      ],
    },
    {
      label: 'Me',
      items: [
        {
          href: '/bookmarks',
          label: 'Bookmarks',
          icon: BookmarksIcon,
          trailingAccessory: null,
          isActive: router.asPath.indexOf('/bookmarks') >= 0,
          trailingAction: data?.viewer?.isViewerSiteAdmin
            ? ThisAddBookmarkDialog
            : null,
          isExternal: false,
        },

        {
          href: '/ama',
          label: 'AMA',
          icon: AMAIcon,
          trailingAccessory: null,
          isActive:
            router.asPath.indexOf('/ama') >= 0 &&
            !router.asPath.startsWith('/ama/pending'),
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
  if (data?.viewer?.isViewerSiteAdmin) {
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
  pagesData?.pages.forEach((page) => {
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
  if (siteData?.viewSite?.social_twitter) {
    social_items.push({
      href: siteData?.viewSite?.social_twitter,
      label: 'Twitter',
      icon: TwitterIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }
  if (siteData?.viewSite?.social_youtube) {
    social_items.push({
      href: siteData?.viewSite?.social_youtube,
      label: 'Youtube',
      icon: YouTubeIcon,
      trailingAccessory: ExternalLinkIcon,
      isActive: false,
      trailingAction: null,
      isExternal: true,
    })
  }
  if (siteData?.viewSite?.social_github) {
    social_items.push({
      href: siteData?.viewSite?.social_github,
      label: 'GitHub',
      icon: GitHubIcon,
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

  if (data?.viewer?.isViewerSiteAdmin) {
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
          icon: StaffDesignIcon,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/domain-mapping',
          trailingAction: null,
          isExternal: false,
        },
        {
          href: '/admin/settings',
          label: 'Settings',
          icon: StaffDesignIcon,
          trailingAccessory: null,
          isActive: router.asPath === '/admin/settings',
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
              <NavigationLink key={j} link={item} />
            ))}
          </ul>
        )
      })}
    </div>
  )
}
