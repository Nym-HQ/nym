import { NextApiRequest } from 'next'

export default async function calculateQuota(req: NextApiRequest) {
  return {
    total: 100,
    usage: 0,
    apiKey: process.env.OPENAI_API_KEY,
  }

  // const username = String(req.headers["x-replit-user-name"]);

  // let usage = 0;
  // let total = Number(process.env.DEFAULT_QUOTA_LIMIT);

  // const quota = await Quota.findOne({
  //   username,
  // });
  // if (quota) {
  //   const gqlReq = await gql.raw({
  //     query: `query repl($id: String!) {
  //       repl(id: $id) {
  //         ...on Repl {
  //           topTippers {
  //             user {
  //               username
  //             }
  //             totalCyclesTipped
  //           }
  //         }
  //       }
  //     }`,
  //     variables: {
  //       id: process.env.REPL_ID,
  //     },
  //   });
  //   if (quota) {
  //     usage = quota.responseCount;
  //   }
  //   if (gqlReq?.data?.repl?.topTippers?.length) {
  //     const tips = gqlReq.data.repl.topTippers;
  //     const tipsByUser = tips.find((x) => x.user.username === username);
  //     if (tipsByUser) {
  //       total += Math.floor(tipsByUser.totalCyclesTipped / 5);
  //     }
  //   }

  //   if (quota.apiKey) {
  //     return {
  //       usage: 0,
  //       total: 1,
  //       apiKey: quota.apiKey,
  //     };
  //   }

  //   return {
  //     total,
  //     usage,
  //     apiKey: null,
  //   };
  // } else {
  //   const q = new Quota({
  //     username,
  //     responseCount: 0,
  //   });
  //   q.save();
  //   return {
  //     total,
  //     usage: 0,
  //     apiKey: null,
  //   };
  // }
}
