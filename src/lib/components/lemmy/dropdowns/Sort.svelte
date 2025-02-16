<script lang="ts">
  import { page } from '$app/state'
  import { t } from '$lib/translations'
  import { searchParam } from '$lib/util.svelte.js'
  import { Select } from 'mono-svelte'
  import {
    ArrowTrendingDown,
    ArrowTrendingUp,
    Calendar,
    CalendarDays,
    ChartBar,
    ChatBubbleLeftRight,
    ChatBubbleOvalLeft,
    Clock,
    Fire,
    Icon,
    PlusCircle,
    Scale,
    Star,
    Sun,
    Trophy,
  } from 'svelte-hero-icons'
  import { backOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'
  import Option from 'mono-svelte/forms/select/Option.svelte'

  interface Props {
    selected: string
    navigate?: boolean
    changeDefault?: boolean
    class?: string
    [key: string]: any
  }

  let {
    selected = $bindable(),
    navigate = true,
    changeDefault = false,
    class: clazz = '',
    ...rest
  }: Props = $props()

  let sort: string = $state(selected?.startsWith('Top') ? 'TopAll' : selected)
  const setSelected = () => (selected = sort)
</script>

<div class="flex flex-row {clazz}">
  <Select
    {...rest}
    class={selected?.startsWith('Top') ? 'rounded-r-none' : ''}
    bind:value={sort}
    onchange={() => {
      setSelected()
      if (navigate) searchParam(page.url, 'sort', selected, 'page', 'cursor')
    }}
  >
    {#snippet customLabel()}
      <span class="flex items-center gap-1">
        <Icon src={ChartBar} size="13" micro />
        {$t('filter.sort.label')}
      </span>
    {/snippet}
    <Option value="Active" icon={ArrowTrendingUp}>
      {$t('filter.sort.active')}
    </Option>
    <Option value="Hot" icon={Fire}>
      {$t('filter.sort.hot')}
    </Option>
    <Option value="Scaled" icon={Scale}>
      {$t('filter.sort.scaled')}
    </Option>
    <Option value="TopAll" icon={Trophy}>
      {$t('filter.sort.top.label')}
    </Option>
    <Option value="New" icon={Star}>
      {$t('filter.sort.new')}
    </Option>
    <Option value="Old" icon={Clock}>
      {$t('filter.sort.old')}
    </Option>
    <Option value="Controversial" icon={ArrowTrendingDown}>
      {$t('filter.sort.controversial')}
    </Option>
    <Option value="MostComments" icon={ChatBubbleOvalLeft}>
      {$t('filter.sort.mostcomments')}
    </Option>
    <Option value="NewComments" icon={ChatBubbleLeftRight}>
      {$t('filter.sort.newcomments')}
    </Option>
  </Select>
  {#if selected?.startsWith('Top')}
    <div transition:fly={{ easing: backOut, x: 2 }}>
      <Select
        class="border-l-0 rounded-l-none"
        bind:value={selected}
        onchange={() => {
          sort = 'TopAll'
          if (navigate)
            searchParam(page.url, 'sort', selected, 'page', 'cursor')
        }}
      >
        {#snippet customLabel()}
          <span class="flex items-center gap-1">
            <Icon src={Clock} size="15" micro />
            {$t('filter.sort.top.time.label')}
          </span>
        {/snippet}
        <Option value="TopAll" icon={PlusCircle}>
          {$t('filter.sort.top.time.all')}
        </Option>
        <Option value="TopNineMonths" icon={Calendar}>
          {$t('filter.sort.top.time.9months')}
        </Option>
        <Option value="TopSixMonths" icon={Calendar}>
          {$t('filter.sort.top.time.6months')}
        </Option>
        <Option value="TopThreeMonths" icon={Calendar}>
          {$t('filter.sort.top.time.3months')}
        </Option>
        <Option value="TopMonth" icon={CalendarDays}>
          {$t('filter.sort.top.time.month')}
        </Option>
        <Option value="TopWeek" icon={CalendarDays}>
          {$t('filter.sort.top.time.week')}
        </Option>
        <Option value="TopDay" icon={Sun}>
          {$t('filter.sort.top.time.day')}
        </Option>
        <Option value="TopTwelveHour" icon={Clock}>
          {$t('filter.sort.top.time.12hours')}
        </Option>
        <Option value="TopSixHour" icon={Clock}>
          {$t('filter.sort.top.time.6hours')}
        </Option>
        <Option value="TopHour" icon={Clock}>
          {$t('filter.sort.top.time.hour')}
        </Option>
      </Select>
    </div>
  {/if}
</div>
