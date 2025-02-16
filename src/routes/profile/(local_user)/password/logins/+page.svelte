<script lang="ts">
  import { publishedToDate } from '$lib/components/util/date.js'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { client } from '$lib/lemmy.svelte.js'
  import { Checkbox, Material } from 'mono-svelte'
  import { Icon, Key } from 'svelte-hero-icons'

  import { UAParser } from 'ua-parser-js'

  let { data } = $props()

  let checked: {
    [token: string]: boolean
  } = $state({})
</script>

<Material
  color="transparent"
  class="flex flex-col gap-4 border overflow-auto max-h-[40rem]
  h-full w-full
  min-w-0 max-w-full"
  rounding="2xl"
  padding="none"
>
  <table>
    <thead class="sticky top-0">
      <tr
        class="divide-x border-b divide-slate-200 dark:divide-zinc-800 h-12 *:px-4
        bg-slate-50 dark:bg-zinc-900"
      >
        <th align="left">User Agent</th>
        <th align="left">IP</th>
        <th align="right" class="w-24">Date</th>
      </tr>
    </thead>
    <tbody
      class="divide-y *:h-14 divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950
      "
    >
      {#each data.tokens as token}
        {@const ua = new UAParser(token.user_agent).getResult()}
        <tr class="divide-x *:px-3 divide-slate-200 dark:divide-zinc-800">
          <td>
            <div class="text-base">{ua.os.name} {ua.os.version}</div>
            <div class="text-sm">{ua.browser.name}</div>
          </td>

          <td>
            <span class="font-mono">{token.ip}</span>
          </td>

          <td align="right">
            <RelativeDate date={publishedToDate(token.published)} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</Material>
