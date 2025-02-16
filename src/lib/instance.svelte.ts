// maybe fix circular dependency, hopefully.

import { browser } from '$app/environment'
import { env } from '$env/dynamic/public'
import { writable } from 'svelte/store'
import { profile } from './auth.svelte'

class InstanceData {
  #instance = $derived(profile.data.instance)

  get data() {
    return this.#instance
  }
}

export let instance = new InstanceData()

export const LINKED_INSTANCE_URL =
  (env.PUBLIC_LOCK_TO_INSTANCE ?? 'true').toLowerCase() == 'true'
    ? env.PUBLIC_INSTANCE_URL
    : undefined

const getDefaultInstance = (): string => {
  if (browser) {
    return env.PUBLIC_INSTANCE_URL || 'lemm.ee'
  } else {
    return env.PUBLIC_INTERNAL_INSTANCE || env.PUBLIC_INSTANCE_URL || 'lemm.ee'
  }
}

export const DEFAULT_INSTANCE_URL = getDefaultInstance()
