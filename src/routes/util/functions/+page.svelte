<script lang="ts">
  import { isImage, isVideo } from '$lib/ui/image.js'
  import { TextInput } from 'mono-svelte'

  let imageInput = $state('')
  let inputIsImage = $derived(isImage(imageInput))
  let inputIsVideo = $derived(isVideo(imageInput))
</script>

<h1 class="font-bold text-2xl">Functions</h1>
<p>Various utility functions.</p>

<h2 class="font-bold text-xl mt-4">Images</h2>
<TextInput
  label="Image/Video URL"
  placeholder="image.jpg"
  bind:value={imageInput}
/>
<p>Image: {inputIsImage}</p>
<p>Video: {inputIsVideo}</p>
