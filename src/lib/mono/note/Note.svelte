<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import { Material } from '../index.js'
  import { Icon, InformationCircle } from 'svelte-hero-icons'

  interface Props {
    content?: string | undefined
    children?: import('svelte').Snippet
    class?: ClassValue
  }

  let { content = undefined, children, class: clazz = '' }: Props = $props()
</script>

<Material
  padding="none"
  color="uniform"
  class="flex flex-row space-x-2 items-center px-4 py-3 !rounded-3xl {clazz}"
>
  <Icon
    src={InformationCircle}
    size="20"
    mini
    class="text-primary-900 dark:text-primary-100"
  />
  <div class="flex flex-col md:flex-row items-center w-full">
    {#if children}
      {@render children?.()}
    {:else if content}
      <p>
        {content}
      </p>
    {/if}
  </div>
</Material>
