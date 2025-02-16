<script lang="ts">
  import { run } from 'svelte/legacy'

  import { browser } from '$app/environment'
  import { tick } from 'svelte'

  let textarea: HTMLTextAreaElement | undefined = $state()

  async function adjustHeight(value: string) {
    await tick()
    if (textarea) {
      textarea.style.height = 'auto' // Reset height to auto to calculate new height
      textarea.style.height = `${textarea.scrollHeight}px` // Set height to the scrollHeight
    }
  }
  interface Props {
    label?: string | undefined
    value: string
    required?: boolean
    class?: string
    [key: string]: any
  }

  let {
    label = undefined,
    value = $bindable(),
    required = false,
    class: clazz = '',
    ...rest
  }: Props = $props()

  run(() => {
    adjustHeight(value)
  })
</script>

<label class="w-full">
  {#if label}
    <div class="text-sm font-medium">
      {label}
      {#if required}
        <span class="text-red-600 font-bold">*</span>
      {/if}
    </div>
  {/if}
  <textarea
    bind:this={textarea}
    oninput={() => adjustHeight(value)}
    bind:value
    {required}
    {...rest}
    rows={1}
    class="font-semibold text-2xl focus:outline-none w-full bg-transparent resize-none {clazz}"
  ></textarea>
</label>
