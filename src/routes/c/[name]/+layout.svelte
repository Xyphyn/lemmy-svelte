<script lang="ts">
  let { data, children } = $props();
</script>

<svelte:head>
  <title>{data.community.community_view.community.title}</title>

  <meta
    name="og:title"
    content={data.community.community_view.community.title}
  />
  {#if data.community.community_view.community.description}
    <meta
      name="og:description"
      content={data.community.community_view.community.description}
    />
  {/if}
</svelte:head>
{@render children?.()}
