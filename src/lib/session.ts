import { browser } from '$app/environment'
import type { Community } from 'lemmy-js-client'

interface SessionStorage {
  lastSeenCommunity: Community | undefined
  postDraft:
    | {
        community: Community | null
        title: string
        body: string
        image: FileList | null
        url: string | undefined
        nsfw: boolean
        loading: boolean
      }
    | undefined
}

export const setSessionStorage = (
  key: keyof SessionStorage,
  value: SessionStorage[typeof key],
) => {
  if (!browser) return
  if (value == undefined) {
    sessionStorage.removeItem(key)
  } else {
    sessionStorage.setItem(key, JSON.stringify(value))
  }
}

export const getSessionStorage = (
  key: keyof SessionStorage,
): SessionStorage[typeof key] => {
  if (!browser) return
  return JSON.parse(sessionStorage.getItem(key)!)
}
