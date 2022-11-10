import slugify from 'slugify'

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
