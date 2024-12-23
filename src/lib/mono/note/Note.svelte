<script lang="ts">
  import { Material } from '../index.js'
  import { Icon, InformationCircle } from 'svelte-hero-icons'

  interface Props {
    content?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let { content = undefined, children }: Props = $props();
</script>

<Material
  padding="none"
  rounding="full"
  color="uniform"
  class="flex flex-row space-x-2 items-center px-4 py-3"
>
  <Icon
    src={InformationCircle}
    size="20"
    mini
    class="text-primary-900 dark:text-primary-100"
  />
  <p>
    {#if children}
      {@render children?.()}
    {:else if content}
      {content}
    {/if}
  </p>
</Material>
