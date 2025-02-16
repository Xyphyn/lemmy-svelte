<script lang="ts">
  interface Props {
    text: string
  }

  let { text }: Props = $props()
</script>

<sup>{text}</sup>
