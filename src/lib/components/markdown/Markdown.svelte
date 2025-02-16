<script lang="ts" module>
  import { marked } from 'marked'
  import {
    MdCode,
    MdHeading,
    MdHr,
    MdHtml,
    MdImage,
    MdLink,
    MdQuote,
    MdList,
    MdTable,
    MdTableBody,
    MdSpoiler,
    MdTableCell,
    MdTableHead,
    MdTableRow,
    MdParagraph,
    MdListItem,
    MdSubscript,
    MdSuperscript,
  } from './renderers/index'
  import { linkify, subSupscriptExtension } from './renderers/plugins'
  import containerExtension from './renderers/spoiler/spoiler'

  export const options: any = {
    mangle: false,
    headerIds: false,
    pedantic: false,
  }

  marked.setOptions(options)

  marked.use(linkify, {
    extensions: [
      containerExtension((params: any) => {
        if (params.type == 'spoiler') {
          return {
            type: 'spoiler',
            raw: params.raw,
            title: params.options,
            tokens: [],
          }
        }
        return null
      }),
      subSupscriptExtension((params: any) => {
        if (params.type == 'subscript') {
          return {
            type: 'subscript',
            raw: params.raw,
            text: params.content,
          }
        }
        if (params.type == 'superscript') {
          return {
            type: 'superscript',
            raw: params.raw,
            text: params.content,
          }
        }
        return null
      }),
    ],
  })

  export const renderers = {
    heading: MdHeading,
    image: MdImage,
    link: MdLink,
    blockquote: MdQuote,
    hr: MdHr,
    html: MdHtml,
    code: MdCode,
    list: MdList,
    // @ts-ignore
    spoiler: MdSpoiler,
    table: MdTable,
    tablebody: MdTableBody,
    tablecell: MdTableCell,
    tablehead: MdTableHead,
    tablerow: MdTableRow,
    paragraph: MdParagraph,
    listitem: MdListItem,
    subscript: MdSubscript,
    superscript: MdSuperscript,
  }
</script>

<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown'

  interface Props {
    source?: string
    inline?: boolean
    noStyle?: boolean
    style?: string
    class?: string
  }

  let {
    source = '',
    inline = false,
    noStyle = false,
    style = '',
    class: clazz = '',
  }: Props = $props()

  options.inline = inline

  let tokens = $derived.by(() => marked.lexer(source))
</script>

<div
  class="{noStyle
    ? ''
    : 'break-words flex flex-col gap-2 leading-[1.5]'} {clazz}"
  {style}
>
  <SvelteMarkdown
    source={tokens}
    {renderers}
    {options}
    isInline={inline || undefined}
  />
</div>
