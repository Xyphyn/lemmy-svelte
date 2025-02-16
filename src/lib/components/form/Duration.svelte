<script lang="ts">
  import { t } from '$lib/translations'
  import { TextInput, Select, Option } from 'mono-svelte'
  import type { Snippet } from 'svelte'

  const multipliers = {
    minute: 60,
    hour: 60 * 60,
    day: 60 * 60 * 24,
    month: 60 * 60 * 24 * 30,
    year: 60 * 60 * 24 * 365,
    permanent: -1,
  }

  type Duration = keyof typeof multipliers

  function calculateValue(number: number, duration: Duration): number {
    return number * multipliers[duration]
  }

  interface Props {
    value: number
    max?: number
    min?: number
    number?: Snippet<[number]>
    duration?: Snippet<[Duration]>
  }

  let {
    value = $bindable(),
    max,
    min = 0,
    number: numberSnippet,
    duration: durationSnippet,
  }: Props = $props()

  let number = $state<number>(0)
  let duration = $state<Duration>(value == -1 ? 'permanent' : 'day')

  $effect(() => {
    value = calculateValue(number, duration)
  })
</script>

<div class="flex flex-row items-end gap-2">
  {#if duration != 'permanent'}
    <TextInput
      {min}
      {max}
      type="number"
      label="Number"
      class="w-24"
      bind:value={number}
    ></TextInput>
  {/if}
  <Select
    selectClass="h-[38px]"
    baseClass="flex-1"
    label={$t('form.time.duration')}
    bind:value={duration}
  >
    <Option value="minute">{$t('form.time.minutes')}</Option>
    <Option value="hour">{$t('form.time.hours')}</Option>
    <Option value="day">{$t('form.time.days')}</Option>
    <Option value="month">{$t('form.time.months')}</Option>
    <Option value="year">{$t('form.time.years')}</Option>
    <Option value="permanent">{$t('form.time.permanent')}</Option>
  </Select>
</div>
