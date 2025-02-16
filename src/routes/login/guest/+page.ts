import { LINKED_INSTANCE_URL } from '$lib/instance.svelte'
import { error } from '@sveltejs/kit'

export function load() {
  if (LINKED_INSTANCE_URL) error(404)
}
