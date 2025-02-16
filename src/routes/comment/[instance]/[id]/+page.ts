import { client } from '$lib/lemmy.svelte.js'
import { redirect } from '@sveltejs/kit'

export async function load({ params, fetch }) {
  const comment = await client({
    instanceURL: params.instance,
    func: fetch,
  }).getComment({
    id: Number(params.id),
  })

  redirect(
    302,
    `/post/${params.instance}/${comment.comment_view.post.id}?thread=${comment.comment_view.comment.path}#${comment.comment_view.comment.id}`,
  )
}
