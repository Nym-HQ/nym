## Nym
An open source solution for personal blogs, bookmarks, newsletters & notes.
## App Domain structure

The system will consist of 3 different apps hosted separately.

### Main app/admin site (e.g: https://app.nymhq.com)

Administrative app to manage your admin account and registered sites.

### Site setup & Mult-tenant (https://{user-subdomain}.nymhq.com or any parked domain)

Same app as the main app site, but the visible content will be different.
This is for registered users and sites to show contents and manage contents.

## Developer Notes

### Environment values (.env)

- `NODE_ENV` (production|development)
- `VERCEL_ENV` (production|preview|development) Set automatically 
- `NEXT_PUBLIC_VERCEL_ENV` (production|preview|development) Set automatically 
- `VERCEL_URL` (https://{nym-xyz}.vercel.app) Set automatically
- `NEXT_PUBLIC_VERCEL_URL` (https://{nym-xyz}.vercel.app) Set automatically
- `PUBLIC_URL` (https://nymhq.com)

#### Fathom

- `NEXT_PUBLIC_FATHOM_SITE_ID`
- `NEXT_PUBLIC_FATHOM_CUSTOM_URL` (https://analytics.example.com)
- `NEXT_PUBLIC_FATHOM_CUSTOM_DOMAIN` (analytics.example.com)

#### CloudFlare

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_IMAGES_KEY`


#### GraphCDN

- `GRAPHCDN_PURGE_KEY`
- `GRAPHCDN_PURGE_ENDPOINT` (https://api.graphcdn.io/purge)

#### PostMark

- `POSTMARK_CLIENT_ID`

#### Revue

- `REVUE_API_KEY`
- `HN_TOKEN`

#### Prisma and PlanetScale

A good resource to understand Prisma and its Shadow DB
 https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database  
 https://blog.tericcabrel.com/understand-the-shadow-database-feature-prisma/  

- `DATABASE_URL` (mysql://user:password@host:port/database)
- `SHADOW_DATABASE_URL` (Only required for local env where we run migration commands)

#### NextAuth.js

- `NEXTAUTH_URL` (https://nymhq.com)
- `NEXTAUTH_SECRET`
- `JWT_SIGNING_KEY`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `TWITTER_API_KEY`  Use Twitter API Key 
- `TWITTER_API_SECRET` Use Twitter API Secret

### Setting up DB for development environment

#### Using PlanetScale

1. Login to https://app.planetscale.com/
2. Create a DB.
3. Copy the connection string for the DB, and set it to the .env file variables. ([See PlanetScale Doc](https://planetscale.com/docs/concepts/connection-strings))
4. Run migration `yarn prisma migrate dev`


### Migrating DB (PScale and Prisma)

#### During Development

1. Edit `prisma/schema.prisma`
2. Format the schema doc

```sh
yarn prisma format
```

3. Migrate dev db

```sh
# Check the changes in the current schema (prisma/schema.prisma)
# and generate migration file, push to DB.
yarn prisma migrate dev
```

#### For Production Deployment

- On PlanetScale, Configure `main` branch as a production branch
- Create a `dev` branch from `main` branch
- Make sure you connect to the `dev` branch only, not to the `main` branch directly.
- When you want to deploy changes from `dev` to `main`, go to https://app.planetscale.com/sov-ventures/nymhq/deploy-requests and create deployment request from `dev` branch to `main` branch.
