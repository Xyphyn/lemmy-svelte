<script lang="ts" module>
  const wrapClass = {
    wrap: '',
    'no-wrap': 'overflow-hidden overflow-ellipsis whitespace-nowrap',
  }
</script>

<script lang="ts">

  interface Props {
    wrap?: keyof typeof wrapClass;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { wrap = 'wrap', class: clazz = '', children }: Props = $props();
  
  let classes = $derived(`${wrapClass[wrap]} ${clazz ?? ''}`)
</script>

<span class={classes}>
  {@render children?.()}
</span>
