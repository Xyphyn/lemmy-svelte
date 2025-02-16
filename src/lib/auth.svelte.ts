import {
  amModOfAny,
  isAdmin,
} from '$lib/components/lemmy/moderation/moderation.js'
import { toast } from 'mono-svelte'
import { DEFAULT_INSTANCE_URL, instance } from '$lib/instance.svelte.js'
import { client, getClient } from '$lib/lemmy.svelte.js'
import { site } from './lemmy.svelte'
import { instanceToURL, moveItem } from '$lib/util.svelte'
import {
  type GetSiteResponse,
  type MyUserInfo,
  type Community,
} from 'lemmy-js-client'
import {
  derived,
  get,
  writable,
  type Readable,
  type Writable,
  type Updater,
} from 'svelte/store'
import { MINIMUM_VERSION, versionIsSupported } from '$lib/version.js'
import { browser } from '$app/environment'
import { env } from '$env/dynamic/public'
import { t } from './translations'

const getDefaultProfile = (): Profile => ({
  id: -1,
  instance: profileData.defaultInstance ?? DEFAULT_INSTANCE_URL,
})

function getFromStorage<T>(key: string): T | undefined {
  if (typeof localStorage == 'undefined') return undefined
  const lc = localStorage.getItem(key)
  if (!lc) return undefined

  return JSON.parse(lc)
}

function setFromStorage(key: string, item: any, stringify: boolean = true) {
  if (typeof localStorage == 'undefined') return
  return localStorage.setItem(key, stringify ? JSON.stringify(item) : item)
}

export interface Profile {
  id: number
  instance: string
  jwt?: string
  user?: PersonData
  username?: string
  avatar?: string
  favorites?: Community[]
  color?: string
}

/**
 * What gets stored in localstorage.
 */
interface ProfileData {
  profiles: Profile[]
  profile: number
  defaultInstance?: string
}

interface PersonData extends MyUserInfo {}

interface Notifications {
  inbox: number
  reports: number
  applications: number
}

const getCookie = (key: string): string | undefined => {
  if (!browser) return undefined

  // sorry i was dying when i wrote this line
  // ask chatgpt or something to explain this for you
  return document?.cookie
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.split('=')?.[0] == key)
    ?.split('=')?.[1]
}

export let profileData = $state<ProfileData>(
  getFromStorage<ProfileData>('profileData') ?? {
    profiles: [
      {
        id: 1,
        instance: DEFAULT_INSTANCE_URL,
        username: 'Guest',
        color: '#505050',
      },
    ],
    profile: 1,
  },
)

class CurrentProfile {
  #data = $derived(
    profileData.profiles.find((i) => i.id == profileData.profile) ??
      getDefaultProfile(),
  )

  get data() {
    return this.#data
  }
  set data(value) {
    if (!value) return
    const index = profileData.profiles.findIndex((i) => i.id == value?.id)
    profileData.profiles[index] = value
  }
}

export let profile = new CurrentProfile()

async function fetchUserData(profile: CurrentProfile) {
  if (profile.data.jwt) {
    site.data = undefined
    notifications.set({ applications: 0, inbox: 0, reports: 0 })

    const res = await userFromJwt(profile.data.jwt, profile.data.instance)
    if (!res?.user)
      toast({
        content:
          "Your account's instance did not return your user data. Your login may have expired.",
        type: 'error',
      })

    site.data = res?.site
    profile.data.user = res?.user
    if (profile.data.user) {
      profile.data.avatar = res?.user?.local_user_view.person.avatar
      profile.data.username = res?.user?.local_user_view.person.name
    }
  } else {
    if (browser) {
      site.data = undefined
      client({ instanceURL: profile.data.instance })
        .getSite()
        .then((res) => (site.data = res))
    }
  }

  return profile
}

export let notifications = writable<Notifications>({
  applications: 0,
  inbox: 0,
  reports: 0,
})

$effect.root(() => {
  $effect(() => {
    const serialized = {
      ...profileData,
      profiles: profileData.profiles.map((p) => serializeUser(p)),
    }

    setFromStorage('profileData', serialized)
    if (serialized.profiles.length == 0) {
      profileData.profiles = [
        {
          id: 1,
          instance: DEFAULT_INSTANCE_URL,
          username: t.get('account.guest') || 'Guest',
        },
      ]
      profileData.profile = 1
    }
  })

  $effect(() => {
    if (profile.data.id || profileData) fetchUserData(profile).then((res) => {})
  })
})

if (
  env.PUBLIC_MIGRATE_COOKIE &&
  profileData.profiles.length == 0 &&
  env.PUBLIC_INSTANCE_URL
) {
  const jwt = getCookie('jwt')
  if (jwt) {
    new Promise(async () => {
      const user = await userFromJwt(jwt, env.PUBLIC_INSTANCE_URL ?? '')
      if (!user) return

      const result = await setUser(
        jwt,
        env.PUBLIC_INSTANCE_URL ?? '',
        user?.user?.local_user_view.person.name,
      )

      if (result)
        toast({
          content:
            'Your instance migrated to Photon, and you were logged in using a leftover cookie.',
          type: 'success',
        })
    })
  }
}

export async function setUser(jwt: string, inst: string, username?: string) {
  try {
    new URL(instanceToURL(inst))
  } catch (err) {
    return
  }

  const user = await userFromJwt(jwt, inst)
    .then((u) => u)
    .catch((err) => {
      toast({ content: err as any, type: 'error' })
    })
  if (!user?.user) {
    toast({
      content: "Your instance's API did not return your user data.",
      type: 'error',
    })
  }

  const id = Math.max(...profileData.profiles.map((p) => p.id)) + 1
  profileData.profile = id
  profileData.profiles.push({
    id: id,
    instance: inst,
    jwt: jwt,
    username: user?.user?.local_user_view.person.name,
    avatar: user?.user?.local_user_view.person.avatar,
  })

  return user
}

async function userFromJwt(
  jwt: string,
  instance: string,
): Promise<
  { user: PersonData | undefined; site: GetSiteResponse } | undefined
> {
  const sitePromise = client({ instanceURL: instance, auth: jwt }).getSite()

  let timer = setTimeout(
    () =>
      toast({
        content: `Still loading your user data...`,
        type: 'warning',
        loading: true,
      }),
    5000,
  )

  const site = await sitePromise
    .then((r) => {
      clearTimeout(timer)
      return r
    })
    .catch((e) => {
      toast({ content: `Failed to contact the instance. ${e}` })
    })

  if (!site) return

  if (!versionIsSupported(site.version, MINIMUM_VERSION)) {
    toast({
      content: `This version of Photon only supports Lemmy instances with version ${MINIMUM_VERSION} or higher. This Lemmy instance is running: ${site.version}`,
      type: 'error',
    })
  }

  const myUser = site.my_user

  return {
    user: myUser,
    site: site,
  }
}

export function resetProfile() {
  profileData.profile = -1
}

export function deleteProfile(id: number) {
  profileData.profiles.splice(
    profileData.profiles.findIndex((p) => p.id == id),
    1,
  )
  if (id == profileData.profile) resetProfile()
}

function serializeUser(user: Profile): Profile {
  return {
    ...user,
    user: undefined,
  }
}

export async function setUserID(id: number) {
  if (!profileData.profiles.find((p) => p.id == id)) return -1
  profileData.profile = id
  return profile
}

export function moveProfile(id: number, up: boolean) {
  try {
    const index = profileData.profiles.findIndex((i) => i.id == id)
    profileData.profiles = moveItem(
      profileData.profiles,
      index,
      index + (up ? -1 : 1),
    )
  } catch (err) {
    // we dont care
  }
}

async function getNotificationCount(jwt: string, mod: boolean, admin: boolean) {
  const unreads = await getClient().getUnreadCount()

  let reports: number = 0
  let applications: number = 0

  if (mod) {
    try {
      const reportRes = await getClient().getReportCount({})

      reports =
        reportRes.comment_reports +
        reportRes.post_reports +
        (reportRes.private_message_reports ?? 0)
    } catch (e) {
      // doesn't matter
    }
  }

  if (admin) {
    try {
      const applicationRes =
        await getClient().getUnreadRegistrationApplicationCount()

      applications = applicationRes.registration_applications
    } catch (e) {
      // doesn't matter
    }
  }

  return {
    unreads: unreads.mentions + unreads.private_messages + unreads.replies,
    reports: reports,
    applications: applications,
  }
}

async function checkInbox() {
  const { user, jwt } = profile.data
  if (!jwt || !user) return

  const notifs = await getNotificationCount(
    jwt,
    amModOfAny(user) ?? false,
    user ? isAdmin(user) : false,
  )

  notifications.set({
    inbox: notifs.unreads,
    applications: notifs.applications,
    reports: notifs.reports,
  })
}

setInterval(checkInbox, 4 * 60 * 1000)
