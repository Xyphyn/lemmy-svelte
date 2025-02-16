import { goto } from '$app/navigation'
import { toast } from 'mono-svelte'
import { settings } from '$lib/settings.svelte'
import { get } from 'svelte/store'
import type { SubscribedType } from 'lemmy-js-client'
import { page } from '$app/state'
import { feature } from '$lib/version.js'
import { client } from '$lib/lemmy.svelte.js'
import { site } from './lemmy.svelte'
import { t } from './translations'

// Despite the name, this will round up
// Example: findClosestNumber([8, 16, 32, 64, 128], 76) will return 128
export const findClosestNumber = (numbers: number[], target: number): number =>
  numbers.reduce((prev, curr) =>
    curr >= target && (prev < target || curr < prev) ? curr : prev,
  )

export const searchParam = (
  url: URL,
  key: string,
  value: string,
  ...deleteKeys: string[]
) => {
  url.searchParams.set(key, value)
  deleteKeys.forEach((k) => url.searchParams.delete(k))
  goto(url, {
    invalidateAll: true,
  })
}

export const fullCommunityName = (name: string, actorId: string) =>
  `${name}@${new URL(actorId).hostname}`

export const placeholders = {
  url: ['https://example.com'],
  post: [
    'Does anybody read these placeholders?',
    'Top 10 reasons why a meteor would help Earth',
    'Title text',
    'I took a picture of something idk',
  ],
  body: ['bottom text', 'body text', 'body text'],
  comment: [
    'what?',
    'new response just dropped',
    'this comment placeholder is very important dont forget',
    'existential crisis in progress',
    'hello user i am a sentient placeholder. please dont type anything or i disappear forever. thanks',
  ],
  get: (type: 'url' | 'post' | 'body' | 'comment') => {
    if (settings.randomPlaceholders) {
      return placeholders[type][
        Math.floor(Math.random() * placeholders[type].length)
      ]
    }

    switch (type) {
      case 'post':
        return t.get('placeholders.title')
      case 'body':
        return t.get('placeholders.body')
      case 'comment':
        return t.get('placeholders.comments')
      case 'url':
        return 'https://example.com'
    }
  },
}

export function moveItem<T>(
  array: T[],
  currentIndex: number,
  newIndex: number,
): T[] {
  if (
    currentIndex < 0 ||
    currentIndex >= array.length ||
    newIndex < 0 ||
    newIndex >= array.length
  ) {
    throw new Error('Invalid index')
  }

  const newArray = [...array]

  // Remove the item from the current index
  const [item] = newArray.splice(currentIndex, 1)

  // Insert the item at the new index
  newArray.splice(newIndex, 0, item)

  return newArray
}

type Maybe<T> = T | undefined | void | null
export const trycatch = <T>(func: () => T): Maybe<T> => {
  try {
    return func()
  } catch (err) {
    toast({
      content: err as any,
      type: 'error',
    })
  }
}

export const removeItem = <T>(array: T[], predicate: (item: T) => boolean) => {
  array.splice(array.findIndex(predicate), 1)
}

export const DOMAIN_REGEX =
  /^(http(s)?:\/\/)?((?!-)[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}(:[0-9]{0,5})?$/g
export const DOMAIN_REGEX_FORMS =
  '(http(s)?://)?((?!-)[A-Za-z0-9]{1,63}.)+[A-Za-z]{2,63}(:[0-9]{0,5})?'

export const isSubscribed = (subscribed: SubscribedType) =>
  subscribed == 'Pending' || subscribed == 'Subscribed'

export async function uploadImage(
  image: File | null | undefined,
  instance: string,
  jwt: string,
): Promise<string | undefined> {
  if (!image) return

  const formData = new FormData()
  formData.append('images[]', image)

  if (feature('unproxiedImageUpload', site.data?.version)) {
    const res = await client({ auth: jwt, instanceURL: instance }).uploadImage({
      image: image,
    })

    if (res.url) return res.url
    else throw new Error(`Failed to upload image. ${res.msg}`)
  } else {
    const response = await fetch(
      `${
        window.location.origin
      }/cors/${instance}/pictrs/image?${new URLSearchParams({
        auth: jwt,
      })}`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const json = await response.json()

    if (json.msg == 'ok') {
      return `https://${instance}/pictrs/image/${json.files?.[0]?.file}`
    }
    throw new Error(
      `${
        (await response.text().catch((_) => undefined)) ??
        'Failed to upload image'
      }: ${response.status}: ${response.statusText}`,
    )
  }
}

export const instanceToURL = (input: string) =>
  input.startsWith('http://') || input.startsWith('https://')
    ? input
    : `https://${input}`

export function canParseUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export function instanceId(actorId: string) {
  return new URL(actorId).hostname
}
