import { type ClassValue, clsx } from 'clsx'
import { customAlphabet } from 'nanoid'
import slugify from 'slugify'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function slugifyString(string: string, trim: boolean = true): string {
  return slugify(string, {
    replacement: '-',
    lower: true,
    strict: true,
    trim: trim,
  })
}

export function isValidParkedDomain(domain: string): boolean {
  return domain && domain.indexOf('.') >= 0
}

export function isPreservedPath(path: string): boolean {
  const preservedPaths = [
    '/api',
    '/admin',
    '/auth',
    '/graphql',
    '/pages',
    '/profile',
    '/u',
  ]
  return (
    preservedPaths.findIndex((p) => path === p || path.startsWith(p + '/')) >= 0
  )
}

export function isValidURL(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}
