import { profile } from '$lib/auth.svelte.js'
import { error, redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'

export function load({ params, url }) {
  if (Number(params.instance)) {
    const split = url.pathname.split('/')

    split.splice(
      2,
      0,
      `${encodeURIComponent(profile.data.instance)?.toLowerCase()}`,
    )

    const newUrl = new URL(url)
    newUrl.pathname = split.join('/')

    redirect(302, newUrl.toString())
  }

  error(404, 'Not found')
}
