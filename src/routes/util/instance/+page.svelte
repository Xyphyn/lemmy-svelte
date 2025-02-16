<script>
  import { env } from '$env/dynamic/public'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import {
    DEFAULT_INSTANCE_URL,
    LINKED_INSTANCE_URL,
  } from '$lib/instance.svelte'
</script>

<Header pageHeader>Photon instance</Header>
<pre>
  photon version: {__VERSION__}
  
  linked instance: {LINKED_INSTANCE_URL ?? 'none'}
  default instance: {DEFAULT_INSTANCE_URL}
  SSR enabled: {env.PUBLIC_SSR_ENABLED ?? 'false'}
  default theme: {env.PUBLIC_THEME ?? "mr xylight's very awesome colors"}
</pre>
