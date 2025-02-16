<script>
  import { options } from '../Markdown.svelte'
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<p class="leading-[1.5] break-words {options.inline ? '' : 'max-w'}">
  {@render children?.()}
</p>

<style>
  .max-w {
    max-width: 80ch;
  }
</style>
