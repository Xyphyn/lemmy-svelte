<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<blockquote class="border-l-2 dark:border-zinc-700 border-slate-300 p-1 px-3">
  {@render children?.()}
</blockquote>
