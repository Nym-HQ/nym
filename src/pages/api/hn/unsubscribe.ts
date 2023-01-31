import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

import { baseUrl } from '~/config/seo'
import { NYM_APP_SITE } from '~/graphql/constants'
import { EmailSubscriptionType } from '~/graphql/types.generated'
import { getSiteByDomain } from '~/lib/multitenancy/server'
import { prisma } from '~/lib/prisma'
import { validEmail } from '~/lib/validators'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query
  const site = await getSiteByDomain(req.headers.host)

  function done() {
    res.writeHead(301, { Location: `${baseUrl}/hn` })
    res.end()
  }

  function error(error) {
    res.status(200).json({ error })
  }

  if (!token || !site || site.id === NYM_APP_SITE.id) {
    return done()
  }

  try {
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SIGNING_KEY)
    const { email } = decoded

    if (!email) {
      error('Invalid token')
    }

    if (!validEmail(email)) {
      error('Invalid email')
    }

    await prisma.emailSubscription.delete({
      where: {
        emailAndType: {
          email,
          type: EmailSubscriptionType.HackerNews,
          siteId: site.id,
        },
      },
    })

    done()
  } catch (err) {
    error(err.message)
  }
}
