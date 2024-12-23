<script lang="ts">
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import StickyCard from '$lib/components/ui/StickyCard.svelte'
  import type { PersonView, SiteView, Tagline } from 'lemmy-js-client'
  import { Badge, Button } from 'mono-svelte'
  import {
    BuildingOffice,
    ChartBar,
    Icon,
    InformationCircle,
    Newspaper,
    ServerStack,
    UserGroup,
  } from 'svelte-hero-icons'
  import Expandable from '../ui/Expandable.svelte'
  import LabelStat from '../ui/LabelStat.svelte'
  import ItemList from './generic/ItemList.svelte'
  import { userLink } from '$lib/lemmy/generic'
  import { t } from '$lib/translations'
  import Entity from '../ui/Entity.svelte'
  import { settings } from '$lib/settings.svelte'
  import { optimizeImageURL } from './post/helpers'

  interface Props {
    site: SiteView
    taglines?: Tagline[] | undefined
    admins?: PersonView[] | undefined
    version?: string | undefined
    class?: string
  }

  let {
    site,
    taglines = undefined,
    admins = undefined,
    version = undefined,
    class: clazz = '',
  }: Props = $props()
</script>

<StickyCard class="w-full {clazz} text-slate-600 dark:text-zinc-400">
  {#if site.site.banner}
    <div
      class="rounded-xl
     bg-slate-100 dark:bg-zinc-925"
    >
      <img
        src={optimizeImageURL(site.site.banner, 512)}
        alt="Site banner"
        class="h-32 object-cover w-full"
        style="border-radius: inherit;"
      />
    </div>
  {/if}
  <Entity name={site.site.name} label={new URL(site.site.actor_id).hostname}>
    {#snippet customIcon()}
      <Avatar
        width={32}
        url={site.site.icon}
        alt={site.site.name}
        circle={false}
      />
    {/snippet}
  </Entity>
  <div class="flex flex-row gap-1 !border-0">
    <Button
      href="/modlog"
      title={$t('routes.modlog')}
      color="ghost"
      size="square-md"
    >
      <Icon src={Newspaper} size="16" mini />
    </Button>
    <Button
      href="/legal"
      title={$t('routes.legal.title')}
      color="ghost"
      size="square-md"
    >
      <Icon src={BuildingOffice} size="16" mini />
    </Button>
    <Button
      href="/instances"
      title={$t('routes.instances')}
      class="3xl:rounded-l-none"
      color="ghost"
      size="square-md"
    >
      <Icon src={ServerStack} size="16" mini />
    </Button>
  </div>

  <div class="flex flex-col gap-1">
    {#if taglines && taglines.length > 0}
      <Markdown
        class="!pt-0"
        source={taglines[Math.floor(Math.random() * taglines.length)].content}
      />
    {/if}

    <hr class="border-slate-200 dark:border-zinc-900 my-1" />
    <Expandable bind:open={settings.expand.about}>
      {#snippet title()}
        <span class="flex items-center gap-1 py-1 px-2">
          <Icon src={InformationCircle} size="16" mini />
          {$t('cards.site.about')}
        </span>
      {/snippet}
      <Markdown source={site.site.description} />
      <div class="my-4"></div>
      <Markdown source={site.site.sidebar} />
    </Expandable>

    <hr class="border-slate-200 dark:border-zinc-900 my-1" />
    <Expandable bind:open={settings.expand.stats}>
      {#snippet title()}
        <span class="flex items-center gap-1 py-1 px-2">
          <Icon src={ChartBar} size="16" mini />
          {$t('cards.site.stats')}
        </span>
      {/snippet}
      <div class="flex flex-row gap-4 flex-wrap">
        <LabelStat
          label={$t('content.users')}
          content={site.counts.users.toString()}
          formatted
        />
        <LabelStat
          label={$t('content.posts')}
          content={site.counts.posts.toString()}
          formatted
        />
        <LabelStat
          label={$t('content.communities')}
          content={site.counts.communities.toString()}
          formatted
        />
      </div>
    </Expandable>

    {#if admins}
      <hr class="border-slate-200 dark:border-zinc-900 my-1" />
      <Expandable bind:open={settings.expand.team}>
        {#snippet title()}
          <span class="flex items-center gap-1 py-1 px-2">
            <Icon src={UserGroup} size="16" mini />
            {$t('cards.site.admins')}
          </span>
        {/snippet}
        <ItemList
          items={admins.map((a) => ({
            id: a.person.id,
            name: a.person.name,
            url: userLink(a.person),
            avatar: a.person.avatar,
            instance: new URL(a.person.actor_id).hostname,
          }))}
        />
      </Expandable>
    {/if}

    {#if version}
      <div class="w-max">
        <Badge label="Lemmy version">
          <Icon src={ServerStack} micro size="14" />
          {version}
        </Badge>
      </div>
    {/if}
  </div>
</StickyCard>
