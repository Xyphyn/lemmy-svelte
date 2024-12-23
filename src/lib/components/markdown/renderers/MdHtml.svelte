<script lang="ts">
  interface Props {
    text: string
  }

  let { text }: Props = $props()
</script>

<p>
  {text}
</p>
