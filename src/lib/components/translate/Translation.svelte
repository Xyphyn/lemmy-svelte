<script lang="ts">
  import { run } from 'svelte/legacy'

  import { Button, Modal, Select, Spinner, TextArea } from 'mono-svelte'
  import { text } from './translation'
  import { locale, t } from '$lib/translations'
  import { settings } from '$lib/settings.svelte'
  import { ArrowRight, Icon } from 'svelte-hero-icons'
  import MarkdownEditor from '../markdown/MarkdownEditor.svelte'

  interface TranslateResponse {
    translatedText: string
  }

  interface Props {
    open?: boolean
  }

  let { open = $bindable(false) }: Props = $props()
  let error = false

  const opened = () => translate($text)

  run(() => {
    if (open) opened()
  })

  let result: Promise<TranslateResponse> | undefined = $state(undefined)
  let from = $state('auto')
  let to = $state($locale)

  async function translate(text: string) {
    const url = settings.translator

    if (!url) {
      return
    }

    error = false

    const requestURL = new URL(`https://${url}/translate`)
    requestURL.searchParams.set('q', text)
    requestURL.searchParams.set('source', from)
    requestURL.searchParams.set('target', to)

    result = fetch(requestURL.toString(), {
      method: 'POST',
    }).then(async (res) => {
      if (!res.ok) {
        error = true
        throw new Error(`${res.status} ${res.statusText}`)
        return {
          translatedText: `${res.status} ${res.statusText}`,
        }
      }

      return await res.json()
    })
  }
</script>

<Modal title={$t('post.actions.more.translate')} bind:open>
  <TextArea bind:value={$text} rows={2}>
    {#snippet suffix()}
      <Button onclick={() => translate($text)} color="primary">
        {$t('post.actions.more.translate')}
      </Button>
    {/snippet}
  </TextArea>
  <div class="flex items-center gap-2 w-full">
    <Select bind:value={from} class="flex-1">
      <option value="auto">Auto</option>
    </Select>
    <Icon src={ArrowRight} mini size="20" />
    <Select on:change={() => translate($text)} bind:value={to} class="flex-1">
      <option value="en">English</option>
      <option value="ar">Arabic</option>
      <option value="zh">Chinese</option>
      <option value="cs">Czech</option>
      <option value="nl">Dutch</option>
      <option value="fi">Finnish</option>
      <option value="fr">French</option>
      <option value="de">German</option>
      <option value="el">Greek</option>
      <option value="it">Italian</option>
      <option value="ja">Japanese</option>
      <option value="pl">Polish</option>
      <option value="es">Spanish</option>
      <option value="sv">Swedish</option>
    </Select>
  </div>
  {#if result}
    {#await result}
      <div
        style="height: 226px; width:100%;"
        class="flex items-center justify-center"
      >
        <Spinner width={32} />
      </div>
    {:then result}
      <MarkdownEditor
        previewButton={false}
        previewing
        tools={false}
        rows={8}
        value={result.translatedText || 'Failed to translate'}
        disabled
      ></MarkdownEditor>
    {:catch err}
      <MarkdownEditor
        previewButton={false}
        previewing
        tools={false}
        disabled
        rows={8}
        value="Failed to translate: {err}"
        class="!border-red-500 !ring-red-500 !text-red-500"
      ></MarkdownEditor>
    {/await}
  {:else}
    <TextArea disabled />
  {/if}
</Modal>
