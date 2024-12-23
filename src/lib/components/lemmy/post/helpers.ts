import { client, getInstance } from '$lib/lemmy.js'
import type { View } from '$lib/settings.svelte'
import { isImage, isVideo } from '$lib/ui/image'
import { canParseUrl, findClosestNumber } from '$lib/util.svelte'
import type { CommentView, PersonView, Post, PostView } from 'lemmy-js-client'

export const isCommentMutable = (comment: CommentView, me: PersonView) =>
  me.person.id == comment.creator.id

export const bestImageURL = (
  post: Post,
  compact: boolean = true,
  width: number = 1024,
) => {
  if (post.thumbnail_url) return optimizeImageURL(post.thumbnail_url, width)
  else if (post.url) return optimizeImageURL(post.url, width)

  return post.url ?? ''
}

export const optimizeImageURL = (
  urlStr: string,
  width: number = 1024,
): string => {
  try {
    const url = new URL(urlStr)

    if (!url.searchParams.has('format')) url.searchParams.set('format', 'webp')

    if (width > 0 && !url.searchParams.has('thumbnail')) {
      url.searchParams.set(
        'thumbnail',
        findClosestNumber(
          [128, 196, 256, 512, 728, 1024, 1536],
          width,
        ).toString(),
      )
    }

    if (width == -1) {
      url.searchParams.delete('thumbnail')
    }

    return url.toString()
  } catch (e) {
    console.log(e)
    return urlStr
  }
}

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/

export const isYoutubeLink = (url?: string): RegExpMatchArray | null => {
  if (!url) return null

  return url?.match?.(YOUTUBE_REGEX)
}

export const postLink = (post: Post) => `/post/${getInstance()}/${post.id}`

export type MediaType = 'video' | 'image' | 'iframe' | 'embed' | 'none'
export type IframeType = 'youtube' | 'video' | 'none'

export const mediaType = (url?: string, view: View = 'cozy'): MediaType => {
  if (url) {
    if (isImage(url)) return 'image'
    if (isVideo(url)) return 'iframe'
    if (isYoutubeLink(url)) return 'iframe'
    if (canParseUrl(url)) return 'embed'
    return 'none'
  }

  return 'none'
}
export const iframeType = (url: string): IframeType => {
  if (isVideo(url)) return 'video'
  if (isYoutubeLink(url)) return 'youtube'
  return 'none'
}

export async function hidePost(
  id: number,
  hide: boolean,
  jwt: string,
): Promise<boolean> {
  const res = await client({ auth: jwt }).hidePost({
    hide: hide,
    post_ids: [id],
  })

  return hide
}
