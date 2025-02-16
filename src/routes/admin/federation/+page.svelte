<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import { profile } from '$lib/auth.svelte.js'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { t } from '$lib/translations.js'
  import { trycatch } from '$lib/util.svelte.js'
  import type { Instance } from 'lemmy-js-client'
  import {
    Button,
    FileInput,
    Material,
    Popover,
    TextInput,
    toast,
  } from 'mono-svelte'
  import {
    Check,
    ExclamationTriangle,
    Icon,
    InformationCircle,
    Plus,
    XMark,
  } from 'svelte-hero-icons'
  import { flip } from 'svelte/animate'
  import { expoInOut, expoOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  let { data = $bindable() } = $props()

  let blockInstance = $state({
      instance: '',
      loading: false,
    }),
    allowInstance = $state({
      instance: '',
      loading: false,
    }),
    saving = $state(false)

  const moderateInstance = async (instance: string, blocked: boolean) => {
    if (instance == '') return
    await trycatch(async () => {
      if (
        !profile.data?.jwt ||
        !data.federated_instances?.federated_instances?.blocked ||
        !data.federated_instances?.federated_instances?.allowed
      )
        return

      if (blocked) blockInstance.loading = true
      else allowInstance.loading = true

      const blockedInstances =
        data.federated_instances.federated_instances.blocked.map(
          (i) => i.domain,
        )

      const allowedInstances =
        data.federated_instances.federated_instances.allowed.map(
          (i) => i.domain,
        )

      if (blocked) blockedInstances.push(instance)
      if (!blocked) allowedInstances.push(instance)

      await getClient().editSite({
        blocked_instances: blockedInstances,
        allowed_instances: allowedInstances,
      })

      const instances = await getClient().getFederatedInstances()

      data.federated_instances = instances

      blockInstance.instance = ''
    })

    blockInstance.loading = false
    allowInstance.loading = false
  }

  const save = async () => {
    const res = await trycatch(async () => {
      if (
        !profile.data?.jwt ||
        !data.federated_instances?.federated_instances?.blocked
      )
        return

      saving = true

      const blockedInstances =
        data.federated_instances.federated_instances.blocked.map(
          (i) => i.domain,
        )
      const allowedInstances =
        data.federated_instances.federated_instances.allowed.map(
          (i) => i.domain,
        )

      return await getClient().editSite({
        allowed_instances: allowedInstances,
        blocked_instances: blockedInstances,
      })
    })

    if (res) {
      toast({
        content: $t('toast.updatedSite'),
        type: 'success',
      })
    }
    saving = false
  }

  let csv = $state<FileList | null>()

  async function parseCsv(files: FileList) {
    if (!(files.length > 0)) return

    const reader = new FileReader()

    reader.onload = (e) => {
      if (!data.federated_instances?.federated_instances?.blocked)
        throw new Error('Missing instance')
      const content = e.target?.result
      if (!content) toast({ content: $t('toast.failCSV'), type: 'warning' })

      try {
        const instances: Instance[] = []
        const str = content?.toString()
        if (!str) throw new Error('No content')

        const lines = str.split(/\r?\n/).slice(1)

        for (const line of lines) {
          if (line == '') continue
          const domain = line.split(',')[0]

          const item: Instance = {
            domain: domain,
            id: Math.floor(Math.random() * 1000000),
            published: new Date().toISOString(),
          }

          instances.push(item)
        }

        data.federated_instances.federated_instances.blocked = instances
      } catch (err) {
        toast({ content: $t('toast.failCSV'), type: 'error' })
      }
    }

    reader.onerror = (e) =>
      toast({ content: $t('toast.failCSV'), type: 'error' })

    reader.readAsText(files[0])
  }

  run(() => {
    if (csv) parseCsv(csv)
  })
</script>

<svelte:head>
  <title>{$t('routes.admin.federation.title')}</title>
</svelte:head>

<Header pageHeader class="font-bold text-2xl flex items-center justify-between">
  {$t('routes.admin.federation.title')}
  <Button color="primary" onclick={save} loading={saving} disabled={saving}>
    {$t('common.save')}
  </Button>
</Header>
{#if data.site && data.federated_instances?.federated_instances?.blocked}
  <FileInput preview={false} bind:files={csv}>
    {#snippet button()}
      <Button class="w-max">
        {#snippet prefix()}
          <Icon src={Plus} mini size="18" />
        {/snippet}
        {$t('routes.admin.federation.csv')}
      </Button>
    {/snippet}
    {#snippet choose()}
      {''}
    {/snippet}
  </FileInput>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1 w-full max-h-[42rem] h-full flex flex-col gap-2">
      <h2 class="font-bold text-lg">{$t('routes.admin.federation.blocked')}</h2>
      <form
        onsubmit={preventDefault(() =>
          moderateInstance(blockInstance.instance, true),
        )}
        class="flex flex-row gap-2"
      >
        <TextInput
          placeholder={$t('routes.admin.federation.blockplaceholder')}
          class="flex-1"
          bind:value={blockInstance.instance}
        />
        <Button
          submit
          loading={blockInstance.loading}
          disabled={blockInstance.loading}
        >
          {$t('routes.admin.federation.block')}
        </Button>
      </form>
      <Material class="h-full overflow-auto" color="distinct">
        <ul
          class="[&>*]:py-3 dark:!divide-zinc-800 {allowInstance.instance != ''
            ? 'opacity-50'
            : ''}"
        >
          {#if data.federated_instances.federated_instances.blocked.length > 0}
            {#each data.federated_instances.federated_instances.blocked.sort( (b, a) => b.domain.localeCompare(a.domain), ) as instance (instance.id)}
              <div
                animate:flip={{ duration: 300, easing: expoOut }}
                class="flex justify-between items-center first:pt-0 last:pb-0"
              >
                <div class="flex flex-col">
                  <span class="font-medium">{instance.domain}</span>
                  <span
                    class="text-xs text-slate-600 dark:text-zinc-400 capitalize"
                  >
                    {instance.software ?? 'Unknown'} • <RelativeDate
                      date={publishedToDate(instance.published)}
                    />
                  </span>
                </div>
                <Button
                  size="square-md"
                  onclick={() => {
                    if (!data.federated_instances?.federated_instances?.blocked)
                      return

                    data.federated_instances.federated_instances.blocked =
                      data.federated_instances?.federated_instances?.blocked.filter(
                        (i) => i.id != instance.id,
                      )
                  }}
                >
                  {#snippet prefix()}
                    <Icon src={XMark} size="16" mini />
                  {/snippet}
                </Button>
              </div>
            {/each}
          {:else}
            <Placeholder
              icon={Check}
              title={$t('routes.admin.federation.emptyBlock.title')}
              description={$t('routes.admin.federation.emptyBlock.description')}
            />
          {/if}
        </ul>
      </Material>
    </div>
    <div class="md:flex-1 w-full max-h-[42rem] flex flex-col gap-2">
      <h2 class="font-bold text-lg flex items-center space-x-1">
        <span>{$t('routes.admin.federation.allowed')}</span>
        {#if allowInstance.instance || !(data.federated_instances.federated_instances.allowed?.length == 0)}
          <Popover openOnHover placement="bottom-end">
            {#snippet target()}
              <Icon
                src={ExclamationTriangle}
                solid
                class="text-yellow-500"
                size="20"
              />
            {/snippet}
            <p class="font-normal">
              {$t('routes.admin.federation.emptyAllow.description')}
            </p>
          </Popover>
        {/if}
      </h2>
      <form
        onsubmit={preventDefault(() =>
          moderateInstance(allowInstance.instance, false),
        )}
        class="flex flex-row gap-2"
      >
        <TextInput
          placeholder={$t('routes.admin.federation.allowplaceholder')}
          class="flex-1"
          bind:value={allowInstance.instance}
        />
        <Button
          submit
          loading={allowInstance.loading}
          disabled={allowInstance.loading}
        >
          {$t('routes.admin.federation.allow')}
        </Button>
      </form>
      <Material class="h-full overflow-auto" color="distinct">
        <ul class="[&>*]:py-3 dark:!divide-zinc-800">
          {#if data.federated_instances.federated_instances.allowed.length > 0}
            {#each data.federated_instances.federated_instances.allowed.sort( (b, a) => b.domain.localeCompare(a.domain), ) as instance (instance.id)}
              <div
                animate:flip={{ duration: 300, easing: expoOut }}
                class="flex justify-between items-center first:pt-0 last:pb-0"
              >
                <div class="flex flex-col">
                  <span class="font-medium">{instance.domain}</span>
                  <span
                    class="text-xs text-slate-600 dark:text-zinc-400 capitalize"
                  >
                    {instance.software ?? 'Unknown'} • <RelativeDate
                      date={publishedToDate(instance.published)}
                    />
                  </span>
                </div>
                <Button
                  size="square-md"
                  onclick={() => {
                    if (!data.federated_instances?.federated_instances?.allowed)
                      return

                    data.federated_instances.federated_instances.allowed =
                      data.federated_instances?.federated_instances?.allowed.filter(
                        (i) => i.id != instance.id,
                      )
                  }}
                >
                  {#snippet prefix()}
                    <Icon src={XMark} size="16" mini />
                  {/snippet}
                </Button>
              </div>
            {/each}
          {:else}
            <div class="my-auto h-max">
              <Placeholder
                icon={Check}
                title={$t('routes.admin.federation.emptyAllow.title')}
                description={$t(
                  'routes.admin.federation.emptyAllow.description',
                )}
              />
            </div>
          {/if}
        </ul>
      </Material>
    </div>
  </div>
{/if}
