<script lang="ts">
  import { locale } from '$lib/translations'

  interface Props {
    number: number
    locale?: string
    options?: Intl.NumberFormatOptions
    class?: string
  }

  let {
    number,
    locale: localeToUse = $locale,
    options = {
      notation: 'compact',
    },
    class: clazz = '',
  }: Props = $props()
</script>

<span class={clazz ?? ''}>
  {Intl.NumberFormat(localeToUse, options).format(number)}
</span>
