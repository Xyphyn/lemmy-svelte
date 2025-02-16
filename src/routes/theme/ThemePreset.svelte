<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { t } from '$lib/translations'
  import {
    calculateVars,
    theme as themeData,
    type Theme,
  } from '$lib/ui/colors.svelte'
  import { action, Button, Material, modal, TextInput } from 'mono-svelte'
  import { CheckCircle, Icon, Trash } from 'svelte-hero-icons'

  interface Props {
    theme: Theme
  }

  let { theme = $bindable() }: Props = $props()

  let editingName = $state(false)
</script>

<button class="h-full" onclick={() => (themeData.data.currentTheme = theme.id)}>
  <Material
    padding="none"
    class="{theme.id == themeData.data.currentTheme
      ? 'ring-2 ring-inset ring-primary-900 dark:ring-primary-100'
      : ''} flex relative cursor-pointer h-full flex-col text-left p-0.5"
    rounding="xl"
  >
    <div
      style="{calculateVars(theme)};"
      class="h-20 w-full rounded-lg rounded-b-none flex flex-row flex-wrap p-3 gap-2
            bg-slate-25 dark:bg-zinc-925"
    >
      <div class="text-slate-900 dark:text-zinc-100 text-xs">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      </div>
      <div
        class="bg-white dark:bg-zinc-900 w-8 h-4 rounded-sm border border-slate-200 dark:border-zinc-800"
      ></div>
      <div
        class="w-3 h-3 bg-primary-900 dark:bg-primary-100 rounded-full ml-auto"
      ></div>
    </div>
    {#if theme.id == themeData.data.currentTheme}
      <Icon
        src={CheckCircle}
        size="20"
        solid
        class="absolute top-0 right-0 m-2 text-primary-900 dark:text-primary-100"
      />
    {/if}
    <div class="px-4 py-2 flex items-center gap-1 justify-between">
      {#if editingName}
        <form onsubmit={preventDefault(() => (editingName = false))}>
          <TextInput bind:value={theme.name}></TextInput>
        </form>
      {:else}
        <button
          onclick={() => {
            if (theme.id > 0) editingName = true
          }}
          class="text-left font-medium text-lg font-display"
        >
          {theme.name}
        </button>
      {/if}
      {#if theme.id > 0}
        <Button
          color="ghost"
          size="square-md"
          class="flex-shrink-0"
          onclick={() => {
            modal({
              actions: [
                action({
                  close: true,
                  type: 'secondary',
                  content: $t('common.cancel'),
                }),
                action({
                  close: true,
                  content: $t('routes.theme.preset.delete.confirm'),
                  type: 'danger',
                  action: () => {
                    const index = themeData.data.themes
                      .map((t) => t.id)
                      .indexOf(theme.id)

                    themeData.data.themes = themeData.data.themes.toSpliced(
                      index,
                      1,
                    )
                    if (theme.id == themeData.data.currentTheme) {
                      themeData.data.currentTheme = 0
                    }
                  },
                }),
              ],
              type: 'error',
              body: '',
              title: $t('routes.theme.preset.delete.title'),
            })
          }}
        >
          {#snippet prefix()}
            <Icon src={Trash} size="16" mini />
          {/snippet}
        </Button>
      {/if}
    </div>
  </Material>
</button>
