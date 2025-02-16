<script lang="ts">
  import { placeholders } from '$lib/util.svelte.js'
  import { Button } from 'mono-svelte'

  let post = $state(placeholders.get('post'))
  let comment = $state(placeholders.get('comment'))
  let url = $state(placeholders.get('url'))
</script>

<h1 class="font-bold text-2xl">Placeholders</h1>
<p>
  Photon randomly generates placeholders for use in text inputs and stuff. If
  you have "Random Placeholders" disabled in settings, they will be empty.
</p>

<h2 class="font-bold text-xl mt-4">Posts</h2>
<p>
  {post}
</p>
<Button onclick={() => (post = placeholders.get('post'))} class="w-max">
  Generate
</Button>

<h2 class="font-bold text-xl mt-4">Comments</h2>
<p>
  {comment}
</p>
<Button onclick={() => (comment = placeholders.get('comment'))} class="w-max">
  Generate
</Button>

<h2 class="font-bold text-xl mt-4">Urls</h2>
<p>
  {url}
</p>
<Button onclick={() => (url = placeholders.get('url'))} class="w-max">
  Generate
</Button>
