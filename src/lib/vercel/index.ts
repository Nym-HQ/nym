const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

export async function addDomainToProject(domain: string) {
  if (VERCEL_PROJECT_ID && VERCEL_API_TOKEN) {
    await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`,
      {
        method: 'POST',
        body: JSON.stringify({ name: domain }),
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        },
      }
    )
  }
}

export async function removeDomainFromProject(domain: string) {
  if (VERCEL_PROJECT_ID && VERCEL_API_TOKEN) {
    await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        },
        method: 'delete',
      }
    )
  }
}
