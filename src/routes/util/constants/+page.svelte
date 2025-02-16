<script>
  import { DOMAIN_REGEX_FORMS } from '$lib/util.svelte'
</script>

<h1 class="font-bold text-2xl">Constants</h1>
<p>Constants used throughout the app.</p>

<table class="table-fixed">
  <thead>
    <tr>
      <td>Name</td>
      <td>Value</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>DOMAIN_REGEX</td>
      <td>{DOMAIN_REGEX_FORMS}</td>
    </tr>
  </tbody>
</table>

<style>
  thead td {
    font-weight: bold;
  }

  td {
    border: 1px solid;
    border-color: #ddd;
    font-family: monospace;
    font-size: 14px;
  }
</style>
