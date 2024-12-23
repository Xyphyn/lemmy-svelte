import { profile } from '$lib/auth.svelte'
import { getClient } from '$lib/lemmy.js'
import { get } from 'svelte/store'

export async function load({ fetch, parent }) {
  const instances = await getClient(undefined, fetch).getFederatedInstances()

  return {
    federated_instances: instances,
  }
}
