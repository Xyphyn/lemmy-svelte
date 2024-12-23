<script lang="ts">
  import { run } from 'svelte/legacy';

  import { expoOut } from 'svelte/easing'
  import { tweened } from 'svelte/motion'

  interface Props {
    progress?: number;
  }

  let { progress = 0 }: Props = $props();

  let tween = tweened(progress, { easing: expoOut })

  run(() => {
    tween.set(progress)
  });
</script>

<div
  class="bg-primary-900 dark:bg-primary-100 h-1 rounded-full"
  style="width: {$tween * 100}%;"
></div>
