<script lang="ts">
  import DebugTree from './DebugTree.svelte'
  interface Props {
    object: any
    isParent?: boolean
  }

  let { object, isParent = false }: Props = $props()
</script>

<ul class:ml-4={!isParent} class="leading-8">
  {#each Object.keys(object) as key}
    <details open={false}>
      <summary class="cursor-pointer">
        <code>{key}</code>
      </summary>
      {#if typeof object[key] === 'object'}
        <DebugTree object={object[key]} isParent={false} />
      {:else}
        <pre class="break-words">{object[key]}</pre>
      {/if}
    </details>
  {/each}
</ul>
