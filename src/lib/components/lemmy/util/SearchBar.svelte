<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { goto } from '$app/navigation'
  import { t } from '$lib/translations'
  import { TextInput } from 'mono-svelte'

  let query: string = $state('')
  let loading = $state(false)

  function search() {
    loading = true
    goto(`/search?q=${query}`).then(() => (loading = false))
  }
  interface Props {
    class?: string
    children?: import('svelte').Snippet<[any]>
  }

  let { class: clazz = '', children }: Props = $props()
</script>

<form onsubmit={preventDefault(search)} class="w-full h-full {clazz}">
  <TextInput
    bind:value={query}
    class="w-full h-full {clazz}"
    placeholder={$t('nav.search')}
    autofocus
  />
</form>
{@render children?.({ search, loading })}
