import { type GetSiteResponse, LemmyHttp } from 'lemmy-js-client'
import { get, writable } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { DEFAULT_INSTANCE_URL, instance } from '$lib/instance.svelte.js'
import { instanceToURL } from '$lib/util.svelte'
import { profile } from '$lib/auth.svelte'
import { toast } from 'mono-svelte'

class SiteData {
  #data = $state<GetSiteResponse>()

  get data() {
    return this.#data
  }

  set data(value) {
    this.#data = value
  }
}

export const site = new SiteData()

const isURL = (input: RequestInfo | URL): input is URL =>
  typeof input == 'object' && 'searchParams' in input

async function customFetch(
  func:
    | ((
        input: RequestInfo | URL,
        init?: RequestInit | undefined,
      ) => Promise<Response>)
    | undefined,
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  auth?: string,
): Promise<Response> {
  const f = func ? func : fetch

  if (init)
    init.headers = {
      ...init.headers,
      ...(auth ? { authorization: `Bearer ${auth}` } : {}),
    }

  if (init?.body && auth) {
    try {
      const json = JSON.parse(init.body.toString())
      json.auth = auth
      init.body = JSON.stringify(json)
    } catch (e) {
      // It seems this isn't a JSON request. Ignore adding an auth parameter.
    }
  }

  const res = await f(input, init)
  if (!res.ok) error(res.status, await res.text())
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
    init?: RequestInit | undefined,
  ) => Promise<Response>
  auth?: string
} = {}) {
  if (!instanceURL) instanceURL = profile.data.instance || DEFAULT_INSTANCE_URL

  let jwt = auth ? auth : profile.data?.jwt

  const headers = jwt ? { authorization: `Bearer ${jwt}` } : {}

  return new LemmyHttp(instanceToURL(instanceURL), {
    fetchFunction: (input, init) => customFetch(func, input, init, jwt),
    //@ts-ignore
    headers: headers,
  })
}

export function getClient(
  instanceURL?: string,
  func?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>,
  auth?: string,
): LemmyHttp {
  return client({ instanceURL, func, auth })
}

export async function validateInstance(instance: string): Promise<boolean> {
  if (instance == '') return false

  try {
    await getClient(instance).getSite()

    return true
  } catch (err) {
    return false
  }
}

export function mayBeIncompatible(
  minVersion: string,
  availableVersion: string,
) {
  if (minVersion.valueOf() === availableVersion.valueOf()) return false

  const versionFormatter = /[\d.]/
  if (
    !minVersion.match(versionFormatter) ||
    !availableVersion.match(availableVersion)
  ) {
    return true
  }

  const splitMinVersion = minVersion.split('.')
  const splitAvailableVersion = availableVersion.split('.')

  if (splitMinVersion.length !== splitAvailableVersion.length) return true

  for (let i = 0; i < splitMinVersion.length; ++i) {
    const minVersionDigit = parseInt(splitMinVersion[i])
    const availableVersionDigit = parseInt(splitAvailableVersion[i])

    if (availableVersionDigit === undefined) return true
    if (minVersionDigit < availableVersionDigit) return false
    if (availableVersionDigit < minVersionDigit) return true
  }

  return false
}
