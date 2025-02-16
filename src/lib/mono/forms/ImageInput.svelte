<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import Label from '../forms/Label.svelte'
  import { generateID } from '../forms/helper.js'
  import { DocumentPlus, Icon } from 'svelte-hero-icons'
  import TextInput from './TextInput.svelte'

  interface Props {
    accept?: string
    files?: FileList | undefined | null
    label?: string | undefined
    id?: string
    url?: string | undefined
    customLabel?: import('svelte').Snippet
  }

  let {
    accept = 'image/*',
    files = $bindable(),
    label = undefined,
    id = generateID(),
    url = undefined,
    customLabel,
  }: Props = $props()

  let dragover = $state(false)

  let previewURL = $derived(files ? URL.createObjectURL(files[0]) : undefined)
</script>

<div class="flex flex-col">
  {#if customLabel || label}
    <Label for={id} text={label} class="mb-1">
      {@render customLabel?.()}
    </Label>
  {/if}
  <label
    class="flex flex-col items-center px-8 py-4 mx-auto w-full rounded-xl
  border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black
  cursor-pointer min-h-36 transition-colors {dragover
      ? 'border-sky-500 text-sky-500'
      : ''}
  {url != undefined ? 'rounded-b-none' : ''}
  "
    ondrop={(event) => {
      event.preventDefault()
      files = event.dataTransfer?.files ?? null
    }}
    ondragover={(event) => {
      event.preventDefault()

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy'
        dragover = true
      }
    }}
    ondragleave={(e) => {
      e.preventDefault()
      dragover = false
    }}
  >
    {#if files}
      <!-- svelte-ignore a11y_missing_attribute -->
      <img
        src={previewURL}
        onload={() => {
          if (previewURL) URL.revokeObjectURL(previewURL)
        }}
        class="w-full max-w-sm h-full rounded-lg"
      />
    {:else}
      <Icon src={DocumentPlus} class="opacity-50" size="36" />
      <p class="text-sm opacity-50">Attach a file</p>
    {/if}
    <input type="file" bind:files {accept} class="hidden" />
  </label>
  {#if url != undefined}
    <TextInput
      class="rounded-t-none border-t-0 rounded-xl"
      placeholder="https://example.com/img1.png"
    />
  {/if}
</div>
