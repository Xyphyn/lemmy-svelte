import { profile } from '$lib/auth.svelte'
import { getClient } from '$lib/lemmy.js'
import { get } from 'svelte/store'

export async function load({ fetch }) {
  return (await getClient(undefined, fetch).getFederatedInstances())
    .federated_instances
}
