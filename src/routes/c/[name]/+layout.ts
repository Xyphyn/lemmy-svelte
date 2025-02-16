import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
import { getClient } from '$lib/lemmy.svelte.js'

export async function load(req: any) {
  const community = await getClient(undefined, req.fetch).getCommunity({
    name: req.params.name,
  })

  return {
    community: community,
    slots: {
      sidebar: {
        component: CommunityCard,
        props: {
          community_view: community.community_view,
          moderators: community.moderators,
        },
      },
    },
  }
}
