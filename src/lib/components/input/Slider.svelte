<script lang="ts">
  import { createBubbler } from 'svelte/legacy'

  const bubble = createBubbler()
  interface Props {
    value: number
    min?: number
    max?: number
    step?: number
  }

  let { value = $bindable(), min = 0, max = 100, step = 1 }: Props = $props()
</script>

<input
  type="range"
  bind:value
  {min}
  {max}
  {step}
  onchange={bubble('change')}
  onclick={bubble('click')}
  onkeydown={bubble('keydown')}
  onkeypress={bubble('keypress')}
  class="w-full appearance-none h-2 cursor-pointer bg-slate-100 dark:bg-zinc-800
  rounded-full range"
/>

<style lang="postcss">
  .range::-moz-range-thumb {
    border-radius: 50%;
    width: 12px;
    height: 12px;
    @apply border-4 bg-white dark:bg-zinc-900 border-primary-900 dark:border-primary-100;
    transition: all 0.25s cubic-bezier(0.075, 0.82, 0.165, 1);
  }

  .range:hover::-moz-range-thumb {
    transform: scale(125%);
  }
  .range:active::-moz-range-thumb {
    transform: scale(90%);
  }
</style>
