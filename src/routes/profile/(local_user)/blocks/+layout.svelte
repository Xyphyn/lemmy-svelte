<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div
  class="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 [&>*]:py-3 first:p-0 last:py-0"
>
  {@render children?.()}
</div>
