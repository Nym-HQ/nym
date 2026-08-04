import * as React from 'react'

import { useContextQuery } from '~/graphql/types.generated'

interface ProfileImageProps {
  /** Override the image source. Prepended ahead of the site logo, owner avatar and owner image. */
  src?: string
  /** Override the alt text. Defaults to the owner or site name. */
  alt?: string
  /** Positioning / sizing classes supplied by the caller (float, width, self-alignment, etc.). */
  className?: string
}

/**
 * A cef.im-style profile photo. This component only resolves the image and
 * renders a rounded, square-cropped <img>; the caller supplies layout (a flex
 * hero column on the homepage, a float on pages/posts) via `className`.
 *
 * Resolves the image from an ordered list of candidates (explicit src → site
 * logo → owner avatar → owner image) and falls through to the next candidate if
 * one fails to load (e.g. a stale Twitter avatar URL that now 404s). Renders
 * nothing when there is no usable image, so it never shows a broken-image glyph.
 */
export function ProfileImage({ src, alt, className = '' }: ProfileImageProps) {
  const { data: context } = useContextQuery()
  const site = context?.context?.site
  const owner = context?.context?.owner

  const candidates = React.useMemo(
    () =>
      [src, site?.logo, owner?.avatar, owner?.image].filter(
        (v, i, arr) => !!v && arr.indexOf(v) === i
      ) as string[],
    [src, site?.logo, owner?.avatar, owner?.image]
  )

  const [failedCount, setFailedCount] = React.useState(0)
  const imageSrc = candidates[failedCount]
  const imageAlt = alt || owner?.name || site?.name || 'Profile photo'

  if (!imageSrc) return null

  return (
    <img
      src={imageSrc}
      alt={imageAlt}
      onError={() => setFailedCount((n) => n + 1)}
      className={`aspect-square rounded-2xl object-cover shadow-sm ${className}`}
    />
  )
}
