import { profile, profileData, type Profile } from '$lib/auth.svelte'
import { getClient } from '$lib/lemmy.js'
import { trycatch } from '$lib/util.svelte'
import type { Community, MyUserInfo, PersonView } from 'lemmy-js-client'
import { get } from 'svelte/store'

export const blockUser = async (block: boolean, id: number) => {
  const auth = get(profile)?.jwt

  if (!auth) throw new Error('Unauthorized')

  const response = await getClient().blockPerson({
    block: block,
    person_id: id,
  })
}

export const isBlocked = (me: MyUserInfo, user: number) =>
  me.person_blocks.map((b) => b.target.id).includes(user)

export const addSubscription = (
  community: Community,
  subscribe: boolean = true
) => {
  const p = get(profile)

  if (!p.user) return

  const index = p.user.follows.map((f) => f.community.id).indexOf(community.id)

  if (subscribe && index == -1) {
    p.user.follows.push({
      // @ts-ignore
      follower: p.user.follows[0]?.follower,
      community: community,
    })
  } else {
    p.user.follows.splice(index, 1)
  }

  profile.set(p)
}

export const addAdmin = async (handle: string, added: boolean, jwt: string) =>
  trycatch(async () => {
    const user = await getClient().resolveObject({
      q: handle,
    })

    if (!user.person) throw new Error('No user found')

    return await getClient().addAdmin({
      added: true,
      person_id: user.person.person.id,
    })
  })

export const hasFavorite = (profile: Profile, id: number): boolean =>
  profile?.favorites?.map((i) => i.id).includes(id) ?? false
