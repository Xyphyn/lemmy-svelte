<script lang="ts">
  import Button from '../button/Button.svelte'
  import { generateID } from '../forms/helper.js'
  import { Label } from '../index.js'
  import { Icon, PaperClip } from 'svelte-hero-icons'

  interface Props {
    accept?: string
    id?: string
    files?: FileList | null
    multiple?: boolean
    preview?: boolean
    label?: string | undefined
    class?: string
    customLabel?: import('svelte').Snippet
    button?: import('svelte').Snippet
    choose?: import('svelte').Snippet
  }

  let {
    accept = '*',
    id = generateID(),
    files = $bindable(null),
    multiple = false,
    preview = true,
    label = undefined,
    class: clazz = '',
    customLabel,
    button,
    choose,
  }: Props = $props()

  let previewURLs = $derived(
    preview && files ? Array.from(files).map(URL.createObjectURL) : undefined,
  )
</script>

<div class="flex flex-col gap-1 {clazz}">
  {#if customLabel || label}
    <Label for={id} text={label}>
      {@render customLabel?.()}
    </Label>
  {/if}
  <label
    class="w-max relative cursor-pointer space-x-2 flex flex-row items-center"
  >
    {#if button}{@render button()}{:else}
      <Button>Browse</Button>
    {/if}
    {#if previewURLs}
      <div
        class="flex flex-row items-center -space-x-1 hover:space-x-1 z-20 h-8"
      >
        {#each previewURLs as file}
          <!-- svelte-ignore a11y_missing_attribute -->
          <img
            src={file}
            onload={() => URL.revokeObjectURL(file)}
            alt={file}
            class="w-8 h-8 object-cover rounded-full hover:w-16
            hover:h-16 transition-all border border-slate-200 ring-1
            ring-slate-50 dark:ring-zinc-950 bg-white dark:bg-zinc-950"
          />
        {/each}
      </div>
    {/if}
    <span class="flex flex-row items-center text-slate-600 dark:text-zinc-400">
      {#if choose}{@render choose()}{:else if (files ?? []).length == 0}
        No file selected.
      {:else}
        {(files ?? []).length} files selected
      {/if}
    </span>
    <input
      type="file"
      bind:files
      {accept}
      {multiple}
      class="w-full h-full inset-0 opacity-0 absolute cursor-pointer"
    />
  </label>
</div>
