<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  type T = $$Generic

  const dispatcher = createEventDispatcher<{ action: any }>()

  function action(detail: any) {
    dispatcher('action', detail)
  }
  interface Props {
    class?: string
    children?: import('svelte').Snippet<[any]>
  }

  let { class: clazz = '', children }: Props = $props()
</script>

<ul
  class="divide-y divide-slate-200 dark:divide-zinc-900 flex flex-col {clazz}"
>
  {@render children?.({ action })}
</ul>
