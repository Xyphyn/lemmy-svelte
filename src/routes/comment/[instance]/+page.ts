import { profile } from '$lib/auth.svelte.js'
import { redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'

export function load({ params }) {
  // If you somehow got to /comment/instance, it likely means you passed in an ID, not an instance.
  redirect(
    302,
    `/comment/${encodeURIComponent(profile.data.instance)}/${params.instance}`,
  )
}
