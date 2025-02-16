<script lang="ts" module>
  export function formatRelativeDate(
    date: Date,
    options: Intl.RelativeTimeFormatOptions,
    locale?: string,
    relativeTo?: Date,
  ) {
    try {
      const now = relativeTo?.getTime() ?? Date.now()

      const diffInMillis = now - date.getTime()

      const thresholds = [
        { unit: 'second', threshold: 1000 },
        { unit: 'minute', threshold: 60 * 1000 },
        { unit: 'hour', threshold: 60 * 60 * 1000 },
        { unit: 'day', threshold: 24 * 60 * 60 * 1000 },
        { unit: 'week', threshold: 7 * 24 * 60 * 60 * 1000 },
        { unit: 'month', threshold: 30 * 24 * 60 * 60 * 1000 },
        { unit: 'year', threshold: 365 * 24 * 60 * 60 * 1000 },
      ]

      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (diffInMillis >= thresholds[i].threshold) {
          const value = Math.round(diffInMillis / thresholds[i].threshold)

          let language = locale ?? 'en'

          const rtf = new Intl.RelativeTimeFormat(language, options)

          return rtf.format(-value, thresholds[i].unit as any)
        }
      }
      return 'Now'
    } catch (err) {
      return 'Invalid Date'
    }
  }
</script>

<script lang="ts">
  import { locale } from '$lib/translations'

  const toLocaleDateString = (date: Date): string => {
    try {
      return date.toLocaleString()
    } catch (err) {
      return 'Invalid Date'
    }
  }

  interface Props {
    date: Date
    relativeTo?: Date | undefined
    options?: Intl.RelativeTimeFormatOptions
    style?: string
    class?: string
  }

  let {
    date,
    relativeTo = undefined,
    options = {
      numeric: 'always',
      style: 'narrow',
    },
    style = '',
    class: clazz = '',
  }: Props = $props()

  let dateTime = $derived(toLocaleDateString(date))
</script>

<time datetime={dateTime} title={dateTime} class={clazz} {style}>
  {formatRelativeDate(date, options, $locale, relativeTo)}
</time>
