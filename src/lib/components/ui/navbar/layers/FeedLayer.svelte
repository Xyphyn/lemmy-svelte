<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { ArrowPath, ChevronDoubleUp } from 'svelte-hero-icons'
  import NavButton from '../NavButton.svelte'
  import { t } from '$lib/translations'
</script>

<NavButton
  on:click={() => scrollTo({ top: 0, behavior: 'instant' })}
  icon={ChevronDoubleUp}
  label={$t('routes.post.scrollToTop')}
  adaptive={false}
/>

<NavButton
  on:click={() => goto($page.url, { invalidateAll: true })}
  icon={ArrowPath}
  label={$t('common.refresh')}
  adaptive={false}
/>
