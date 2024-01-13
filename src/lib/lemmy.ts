import { type GetSiteResponse, LemmyHttp, type SortType, type ListingType, type PostView } from 'lemmy-js-client'
import { get, writable, type Writable } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { instance } from '$lib/instance.js'
import { instanceToURL } from '$lib/util.js'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'

export const site = writable<GetSiteResponse | undefined>(undefined)

const isURL = (input: RequestInfo | URL): input is URL =>
  typeof input == 'object' && 'searchParams' in input

const toURL = (input: RequestInfo | URL): URL | undefined => {
  if (isURL(input)) return input

  try {
    return new URL(input.toString())
  } catch (e) {
    return
  }
}

async function customFetch(
  func:
    | ((
        input: RequestInfo | URL,
        init?: RequestInit | undefined
      ) => Promise<Response>)
    | undefined,
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  auth?: string
): Promise<Response> {
  const f = func ? func : fetch

  if (init?.body && auth) {
    try {
      const json = JSON.parse(init.body.toString())
      json.auth = auth
      init.body = JSON.stringify(json)
    } catch (e) {
      // It seems this isn't a JSON request. Ignore adding an auth parameter.
    }
  }

  const url = toURL(input)
  if (auth && url) url.searchParams.set('auth', auth)

  const res = await f(url ?? input, init)
  if (!res.ok) throw error(res.status, await res.text())
  return res
}

export function client({
  instanceURL,
  func,
  auth,
}: {
  instanceURL?: string
  func?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>
  auth?: string
} = {}) {
  if (!instanceURL) instanceURL = get(instance)

  let jwt = auth ? auth : get(profile)?.jwt

  let headers = jwt ? { Authorization: `Bearer ${jwt}` } : { Authorization: '' }

  return new LemmyHttp(instanceToURL(instanceURL), {
    fetchFunction: (input, init) => customFetch(func, input, init, jwt),
    headers: headers,
  })
}

export function getClient(
  instanceURL?: string,
  func?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>,
  auth?: string
): LemmyHttp {
  return client({ instanceURL, func, auth })
}

export const getInstance = () => encodeURIComponent(get(instance))

export async function validateInstance(instance: string): Promise<boolean> {
  if (instance == '') return false

  try {
    await getClient(instance).getSite()

    return true
  } catch (err) {
    return false
  }
}

export function mayBeIncompatible(minVersion: string, availableVersion: string) {
  if (minVersion.valueOf() === availableVersion.valueOf()) return false;

  const versionFormatter = /[\d.]/;
  if (!minVersion.match(versionFormatter) || !availableVersion.match(availableVersion)) {
    return true;
  }

  const splitMinVersion = minVersion.split('.');
  const splitAvailableVersion = availableVersion.split('.');

  if (splitMinVersion.length !== splitAvailableVersion.length) return true;

  for (let i = 0; i < splitMinVersion.length; ++i) {
    const minVersionDigit = parseInt(splitMinVersion[i]);
    const availableVersionDigit = parseInt(splitAvailableVersion[i]);

    if (availableVersionDigit === undefined) return true;
    if (minVersionDigit < availableVersionDigit) return false;
    if (availableVersionDigit < minVersionDigit) return true;
  }

  return false;
}

export async function loadPosts(url: URL, fetch: any) {
	const cursor = url.searchParams.get('cursor') as string | undefined
	const prevCursor = url.searchParams.get('prevCursor') as string | undefined
	const page = Number(url.searchParams.get('page')) || undefined

	const sort: SortType =
		(url.searchParams.get('sort') as SortType) ||
		get(userSettings).defaultSort.sort
	const listingType: ListingType =
		(url.searchParams.get('type') as ListingType) ||
		get(userSettings).defaultSort.feed

	const posts = await getClient(undefined, fetch).getPosts({
		limit: 20,
		page: page,
		sort: sort,
		type_: listingType,
		page_cursor: cursor,
	})

	try {
		return {
			sort: sort,
			listingType: listingType,
			page: page || 1,
			posts: posts,
			cursor: {
				next: posts.next_page,
				back: prevCursor,
				current: cursor,
			},
		}
	} catch (err) {
		throw error(500, {
			message: 'Failed to fetch homepage.',
		})
	}
}

export const loadedPosts: Writable<PostView[]> = writable([]);
