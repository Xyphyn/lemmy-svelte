<script lang="ts">
  import { run } from 'svelte/legacy'

  import { profile } from '$lib/auth.svelte.js'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { t } from '$lib/translations'
  import { uploadImage } from '$lib/util.svelte.js'
  import { ImageInput, toast } from 'mono-svelte'
  import { Button, Label, Modal, TextArea } from 'mono-svelte'
  import { createEventDispatcher, tick } from 'svelte'
  import {
    Bold,
    CodeBracket,
    DocumentPlus,
    ExclamationTriangle,
    H1,
    Icon,
    Italic,
    Link,
    ListBullet,
    Photo,
    Strikethrough,
  } from 'svelte-hero-icons'
  import ImageUploadModal from '../lemmy/modal/ImageUploadModal.svelte'
  import type { HTMLTextareaAttributes } from 'svelte/elements'
  import type { TextAreaProps } from 'mono-svelte/forms/TextArea.svelte'

  let textArea: HTMLTextAreaElement | undefined = $state()

  function replaceTextAtIndices(
    str: string,
    startIndex: number,
    endIndex: number,
    replacement: string
  ) {
    return str.substring(0, startIndex) + replacement + str.substring(endIndex)
  }

  function wrapSelection(start: string, end: string) {
    if (!textArea) return
    const startPos = textArea.selectionStart
    const endPos = textArea.selectionEnd

    const substring = textArea.value.substring(startPos, endPos)
    let newText = `${start}${substring}${end}`

    textArea.value = replaceTextAtIndices(
      textArea.value,
      startPos,
      endPos,
      newText
    )

    textArea.focus()
    textArea.selectionStart = startPos + start.length
    textArea.selectionEnd = endPos + start.length

    value = textArea.value
  }

  let uploadingImage = $state(false)
  let image = $state<any>(null)

  const shortcuts = {
    KeyB: () => wrapSelection('**', '**'),
    KeyI: () => wrapSelection('*', '*'),
    KeyS: () => wrapSelection('~~', '~~'),
    KeyH: () => wrapSelection('\n# ', ''),
    KeyK: () => wrapSelection('[](', ')'),
    Enter: (e: any) => {
      onconfirm?.(value)
      const newEvent = new Event('submit', { cancelable: true })
      e?.target?.form?.dispatchEvent(newEvent)
    },
  }

  async function adjustHeight() {
    await tick()
    if (textArea) {
      textArea.style.height = 'auto' // Reset height to auto to calculate new height
      textArea.style.height = `${textArea.scrollHeight}px` // Set height to the scrollHeight
    }
  }

  interface Props extends TextAreaProps {
    images?: boolean
    value?: string
    label?: string | undefined
    previewButton?: boolean
    tools?: boolean
    disabled?: boolean
    rows?: number
    beforePreview?: (input: string) => string
    previewing?: boolean
    class?: string
    customLabel?: import('svelte').Snippet
    children?: import('svelte').Snippet
    onconfirm?: (value: string) => void
  }

  let {
    images = true,
    value = $bindable(''),
    label = undefined,
    previewButton = true,
    tools = true,
    disabled = false,
    rows = 2,
    beforePreview = (input) => input,
    previewing = $bindable(false),
    class: clazz = '',
    customLabel,
    children,
    onconfirm,
    ...rest
  }: Props = $props()

  $effect(() => {
    if (!previewing && value) adjustHeight()
  })
</script>

{#if uploadingImage && images}
  <ImageUploadModal
    bind:open={uploadingImage}
    bind:image
    onupload={(e) => {
      e.forEach((i) => {
        wrapSelection(`![](${i})\n\n`, '')
      })
    }}
  />
{/if}

<div>
  {#if label || customLabel}
    <Label>
      {#if label}
        {label}
      {:else if customLabel}
        {@render customLabel?.()}
      {/if}
    </Label>
  {/if}
  <div
    class="flex flex-col border border-slate-200 border-b-slate-300 dark:border-t-zinc-700/70 dark:border-zinc-800
    focus-within:border-primary-900 focus-within:dark:border-primary-100 focus-within:ring ring-slate-300
    dark:ring-zinc-700 rounded-xl
overflow-hidden transition-colors {clazz}"
    class:mt-1={label}
  >
    {#if previewing}
      <div
        class="px-3 py-2.5 overflow-auto text-sm resize-y bg-white dark:bg-zinc-950"
      >
        <Markdown source={beforePreview(value)} />
      </div>
    {:else}
      {#if tools}
        <!--Toolbar-->
        <div
          class="[&>*]:flex-shrink-0 flex flex-row overflow-auto p-1.5 gap-1.5 border-b
          border-slate-200 dark:border-zinc-900 {disabled
            ? 'opacity-60 pointer-events-none'
            : ''}"
        >
          <Button
            onclick={() => wrapSelection('**', '**')}
            title="Bold"
            size="square-md"
          >
            <Icon src={Bold} size="16" mini />
          </Button>
          <Button
            onclick={() => wrapSelection('*', '*')}
            title="Italic"
            size="square-md"
          >
            <Icon src={Italic} size="16" micro />
          </Button>
          <Button
            onclick={() => wrapSelection('[', '](https://example.com)')}
            title="Link"
            size="square-md"
          >
            <Icon src={Link} size="16" micro />
          </Button>
          <Button
            onclick={() => wrapSelection('\n# ', '')}
            title="Header"
            size="square-md"
          >
            <Icon src={H1} size="16" micro />
          </Button>
          <Button
            onclick={() => wrapSelection('~~', '~~')}
            title="Strikethrough"
            size="square-md"
          >
            <Icon src={Strikethrough} size="16" micro />
          </Button>
          <Button
            onclick={() => wrapSelection('\n> ', '')}
            title="Quote"
            size="square-md"
          >
            <span class="font-bold font-serif text-lg">"</span>
          </Button>
          <Button
            onclick={() => wrapSelection('\n- ', '')}
            title="List"
            size="square-md"
          >
            <Icon src={ListBullet} micro size="16" />
          </Button>
          <Button
            onclick={() => wrapSelection('`', '`')}
            title="Code"
            size="square-md"
          >
            <Icon src={CodeBracket} micro size="16" />
          </Button>
          <Button
            onclick={() =>
              wrapSelection('::: spoiler <spoiler title>\n', '\n:::')}
            title="Spoiler"
            size="square-md"
          >
            <Icon src={ExclamationTriangle} micro size="16" />
          </Button>
          <Button
            onclick={() => wrapSelection('~', '~')}
            title="Subscript"
            size="square-md"
          >
            <span class="font-bold">
              X
              <sub>1</sub>
            </span>
          </Button>
          <Button
            onclick={() => wrapSelection('^', '^')}
            title="Superscript"
            size="square-md"
          >
            <span class="font-bold">
              X
              <sup>1</sup>
            </span>
          </Button>
          {#if images}
            <Button
              onclick={() => (uploadingImage = !uploadingImage)}
              title="Image"
              size="square-md"
            >
              <Icon src={Photo} size="16" micro />
            </Button>
          {/if}
        </div>
      {/if}
      <!--Actual text area-->
      <TextArea
        class="bg-inherit z-0 border-0 rounded-none !ring-0 focus:!ring-transparent !transition-none resize-none"
        bind:value
        bind:element={textArea}
        onkeydown={(e) => {
          if (disabled) return
          if (e.ctrlKey || e.metaKey) {
            // @ts-ignore
            let shortcut = shortcuts[e.code]
            if (shortcut) {
              e.preventDefault()
              shortcut?.(e)
            }
          }
        }}
        oninput={adjustHeight}
        onpaste={(e) => {
          if (!e.clipboardData?.files) return
          const files = Array.from(e.clipboardData.files)
          if (files[0]?.type.startsWith('image/')) {
            image = e.clipboardData.files[0]
            uploadingImage = true
          }
        }}
        {rows}
        {...rest}
      />
    {/if}

    {#if previewButton}
      <div
        class="p-2 flex flex-row items-center w-full bg-white dark:bg-zinc-950 gap-1"
      >
        {#if previewButton}
          <MultiSelect
            bind:selected={previewing}
            options={[false, true]}
            optionNames={[$t('form.edit'), $t('form.preview')]}
          />
        {/if}
        {@render children?.()}
      </div>
    {/if}
  </div>
</div>
