<script lang="ts">
  import { settings } from '$lib/settings.svelte'

  interface Props {
    width?: number
  }

  let { width = 48 }: Props = $props()
</script>

<svg
  {width}
  height={width}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="inline fill-black dark:fill-white hover:fill-slate-700 hover:dark:fill-zinc-300 transition-colors"
>
  <path
    id="hexagon"
    d="M45.5 10.8868C48.594 9.10042 52.406 9.10042 55.5 10.8868L82.3061 26.3632C85.4001 28.1496 87.3061 31.4508 87.3061 35.0235V65.9765C87.3061 69.5492 85.4001 72.8504 82.3061 74.6368L55.5 90.1132C52.406 91.8996 48.594 91.8996 45.5 90.1132L18.6939 74.6368C15.5999 72.8504 13.6939 69.5492 13.6939 65.9765V35.0235C13.6939 31.4508 15.5999 28.1496 18.6939 26.3632L45.5 10.8868Z"
    class=""
  />
</svg>
