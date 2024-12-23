<script lang="ts">
  interface Props {
    small?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any
  }

  let { small = false, class: clazz = '', children, ...rest }: Props = $props();
  
</script>

<span
  {...rest}
  class="{!small ? 'text-lg' : 'text-xs'} font-semibold {clazz}"
>
  {@render children?.()}
</span>
