<script lang="ts">
  import { settings } from '$lib/settings.svelte'

  interface Props {
    width?: number
  }

  let { width = 48 }: Props = $props()

  const monthColors: {
    [x: number]: string
  } = {
    1: '--hover-color-1: #B0E0E6; --hover-color-2: #FFFFFF;',
    2: '--hover-color-1: #A50026; --hover-color-2: #FFB6C1;',
    3: '--hover-color-1: #90EE90; --hover-color-2: #FFFFE0;',
    4: '--hover-color-1: #87CEEB; --hover-color-2: #FFD700;',
    5: '--hover-color-1: #FFCC00; --hover-color-2: #FFFF99;', // Sunflower to Butter Yellow
    6: '--hover-color-1: #4682B4; --hover-color-2: #F4A460;',
    7: '--hover-color-1: #00BFFF; --hover-color-2: #1E90FF;', // Deep Sky Blue to Dodger Blue
    8: '--hover-color-1: #FF5733; --hover-color-2: #FFD700;',
    9: '--hover-color-1: #D7FF00; --hover-color-2: #8CFF00;', // Gold to Orange
    10: '--hover-color-1: #FF6347; --hover-color-2: #EE45AA;', // Tomato to Orange Red
    11: '--hover-color-1: #ffaa10; --hover-color-2: #eeBF11;', // Maroon to Amber
    12: '--hover-color-1: #228B22; --hover-color-2: #FFFFFF;',
  }

  let monthColor = $derived(monthColors[new Date().getMonth() + 1])
</script>

<svg
  {width}
  height={width}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="inline"
  style={monthColor}
>
  <linearGradient
    gradientTransform="rotate(315, 0.5, 0.5)"
    x1="50%"
    y1="0%"
    x2="50%"
    y2="100%"
    id="gradient"
  >
    <stop stop-color="var(--color-1)" stop-opacity="1" offset="0%" />
    <stop stop-color="var(--color-2)" stop-opacity="1" offset="100%" />
  </linearGradient>
  <path
    id="hexagon"
    d="M45.5 10.8868C48.594 9.10042 52.406 9.10042 55.5 10.8868L82.3061 26.3632C85.4001 28.1496 87.3061 31.4508 87.3061 35.0235V65.9765C87.3061 69.5492 85.4001 72.8504 82.3061 74.6368L55.5 90.1132C52.406 91.8996 48.594 91.8996 45.5 90.1132L18.6939 74.6368C15.5999 72.8504 13.6939 69.5492 13.6939 65.9765V35.0235C13.6939 31.4508 15.5999 28.1496 18.6939 26.3632L45.5 10.8868Z"
    class="fill-[url(#gradient)]"
  />
</svg>

<style>
  svg {
    --color-1: black;
    --color-2: black;
    --hover-color-1: #7f27c7;
    --hover-color-2: #f30386;
  }

  :global(.dark) svg {
    --color-1: white;
    --color-2: white;
  }

  :global(.logo:hover) svg {
    --color-1: var(--hover-color-1);
    --color-2: var(--hover-color-2);
  }

  stop {
    transition: stop-color 200ms ease-out;
  }
</style>
