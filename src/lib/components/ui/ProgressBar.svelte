<script lang="ts">
  import { expoOut } from 'svelte/easing'
  import { Tween } from 'svelte/motion'

  interface Props {
    progress?: number
  }

  let { progress = 0 }: Props = $props()

  let tween = new Tween(progress, { easing: expoOut })

  $effect(() => {
    tween.set(progress)
  })
</script>

<div
  class="bg-primary-900 dark:bg-primary-100 h-1 rounded-full"
  style="width: {tween.current >= 0 ? tween.current * 100 : 0}%;"
></div>
