<script lang="ts">
  import { profile } from '$lib/auth.svelte.js'
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte'
  import { errorMessage } from '$lib/lemmy/error'
  import { t } from '$lib/translations'
  import { uploadImage } from '$lib/util.svelte.js'
  import { ImageInput, Spinner, toast } from 'mono-svelte'
  import { Button, Modal } from 'mono-svelte'
  import { DocumentPlus, Icon } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  interface Props {
    open: boolean
    image?: FileList | null
    preview?: boolean
    multiple?: boolean
    onupload?: (urls: string[]) => void
  }

  let {
    open = $bindable(),
    image = $bindable(null),
    preview = true,
    multiple = true,
    onupload,
  }: Props = $props()
  let progress = $state(1)

  let previewURLs = $derived(
    preview && image ? Array.from(image).map(URL.createObjectURL) : undefined
  )

  async function upload() {
    if (!profile.data?.jwt || image == null) return

    progress = 0

    try {
      const uploaded = (
        await Promise.all(
          Array.from(image).map((i) =>
            uploadImage(i, profile.data.instance, profile.data.jwt!)
              .then((uploaded) => {
                progress += 1 / (image?.length ?? 0)
                return uploaded
              })
              .catch((err) => {
                toast({ content: errorMessage(err), type: 'error' })
                return 'Failed to upload'
              })
          )
        )
      ).filter((i) => i != undefined)

      if (!uploaded) throw new Error('Image upload returned undefined')

      onupload?.(uploaded)
      progress = 1
      open = false
    } catch (err) {
      toast({
        content: errorMessage(err),
        type: 'error',
      })
    }

    progress = 1
  }
</script>

<Modal bind:open>
  {#snippet customTitle()}
    <div class="flex items-center gap-2">Upload image</div>
  {/snippet}
  {#if progress != 1}
    <div transition:slide={{ duration: 500, easing: expoOut }} class="w-full">
      <ProgressBar {progress} />
    </div>
  {/if}
  <form
    class="flex flex-col gap-4"
    onsubmit={(e) => {
      e.preventDefault()
      upload()
    }}
  >
    <label
      for="image-input"
      class="p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors
      border-slate-300 dark:border-zinc-700 hover:border-primary-900 dark:hover:border-primary-100"
    >
      {#if previewURLs}
        <div
          class="grid gap-x-2 gap-y-px max-h-64 overflow-auto
        {multiple ? 'grid-cols-3 grid-rows-2' : 'grid-cols-1 grid-rows-1'}"
        >
          {#each previewURLs as file}
            <!-- svelte-ignore a11y_missing_attribute -->
            <img
              src={file}
              onload={() => URL.revokeObjectURL(file)}
              alt={file}
              class="w-full rounded-md h-full object-cover transition-all
              border border-slate-200 dark:border-zinc-800 ring-1
            ring-slate-50 dark:ring-zinc-950 bg-white dark:bg-zinc-950"
            />
          {/each}
        </div>
      {:else}
        <div
          class="flex flex-col justify-center w-full items-center gap-2
        text-slate-600 dark:text-zinc-400"
        >
          <Icon src={DocumentPlus} size="32" />
          <span class="font-medium text-sm">{$t('form.post.selectFile')}</span>
        </div>
      {/if}
      <input
        {multiple}
        type="file"
        accept="image/*"
        class="hidden"
        id="image-input"
        bind:files={image}
      />
    </label>
    <Button
      loading={progress != 1}
      disabled={progress != 1 || image == null}
      submit
      color="primary"
      size="lg"
    >
      Upload
    </Button>
  </form>
</Modal>
