<script lang="ts">
  import { t } from '$lib/translations'
  import { Button, Material, toast } from 'mono-svelte'
  import { Icon, ClipboardDocument } from 'svelte-hero-icons'

  interface Props {
    raw: string
  }

  let { raw }: Props = $props()

  function parseCodeblock(src: string): {
    code: string
    lang?: string
  } {
    const match = /^```(.*)/gi.exec(src)

    if (match?.[1]) {
      return {
        code: src.replace(/^```(.*)/gi, '').replaceAll('```', ''),
        lang: match?.[1],
      }
    } else {
      return { code: src.replaceAll('```', '') }
    }
  }

  let codeblock = $derived(parseCodeblock(raw))
</script>

<Material
  padding="none"
  class="flex flex-col rounded-xl
  divide-y divide-slate-200 dark:divide-zinc-800 overflow-hidden"
>
  <div
    class="w-full bg-slate-25 dark:bg-zinc-925 h-9 flex items-center justify-between p-2"
  >
    <pre class="code-baseline text-xs"> {codeblock.lang}</pre>
    <Button
      size="square-sm"
      color="tertiary"
      onclick={() => {
        navigator?.clipboard?.writeText(codeblock.code)
        toast({ content: $t('toast.copied') })
      }}
    >
      <Icon
        src={ClipboardDocument}
        size="16"
        micro
        class="text-slate-600 dark:text-zinc-400"
      />
    </Button>
  </div>
  <pre
    class="code-baseline w-full overflow-x-auto text-xs bg-white dark:bg-zinc-950 px-4">
    {codeblock.code}
  </pre>
</Material>
