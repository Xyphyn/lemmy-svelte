<script lang="ts">
  import { Badge, Modal } from "mono-svelte"
  import type { Data } from "./fediseer"
  import SectionTitle from "$lib/components/ui/SectionTitle.svelte"
  import LabelStat from "$lib/components/ui/LabelStat.svelte"
  import Expandable from "$lib/components/ui/Expandable.svelte"

  interface Props {
    open?: boolean;
    data: Data;
  }

  let { open = $bindable(false), data }: Props = $props();
</script>

<Modal bind:open title="Fediseer">
  <div class="flex flex-col [&>*]:py-2 divide-y divide-slate-300 dark:divide-zinc-800">
  <Expandable class="flex flex-col gap-4">
    {#snippet title()}
            <SectionTitle class="flex gap-2 items-center flex-row" >
        Endorsements <Badge class="w-max h-max" color="green-subtle">{data.endorsements.instances.length}</Badge>
      </SectionTitle>
          {/snippet}
    <div class="flex flex-row gap-6 flex-wrap">
      {#each data.endorsements.instances as instance}
        <div class="flex flex-col">
          <LabelStat
            labelClass="!text-sm"
            label={instance.domain}
            formatted={false}
            content={instance.endorsement_reasons?.[0] || '👍'}>
          </LabelStat>
        </div>
      {/each}
    </div>
  </Expandable>
  <Expandable class="flex flex-col gap-4">
    {#snippet title()}
            <SectionTitle class="flex gap-2 items-center flex-row" >
        Guarantees <Badge class="w-max h-max" color="green-subtle">{data.guarantees.instances.length}</Badge>
      </SectionTitle>
          {/snippet}
    <div class="flex flex-row gap-6 flex-wrap">
      {#each data.guarantees.instances as instance}
        <div class="flex flex-col">
          <LabelStat
            labelClass="!text-sm"
            label={instance.domain}
            formatted={false}
            content={instance.guarantee_reasons?.[0] || '👍'}>
          </LabelStat>
        </div>
      {/each}
    </div>
  </Expandable>
  <Expandable class="flex flex-col gap-4">
    {#snippet title()}
            <SectionTitle class="flex gap-2 items-center flex-row" >
        Censures <Badge class="w-max h-max" color="red-subtle">{data.censures.instances.length}</Badge>
      </SectionTitle>
          {/snippet}
    <div class="flex flex-row gap-6 flex-wrap">
      {#each data.censures.instances as instance}
        <div class="flex flex-col">
          <LabelStat
            labelClass="!text-sm"
            label={instance.domain}
            formatted={false}
            content={instance.censure_reasons?.[0] || '👎'}>
          </LabelStat>
        </div>
      {/each}
    </div>
  </Expandable>
  <Expandable class="flex flex-col gap-4">
    {#snippet title()}
            <SectionTitle class="flex gap-2 items-center flex-row" >
        Hesitations <Badge class="w-max h-max" color="red-subtle">{data.hesitations.instances.length}</Badge>
      </SectionTitle>
          {/snippet}
    <div class="flex flex-row gap-6 flex-wrap">
      {#each data.hesitations.instances as instance}
        <div class="flex flex-col">
          <LabelStat
            labelClass="!text-sm"
            label={instance.domain}
            formatted={false}
            content={instance.hesitation_reasons?.[0] || '👎'}>
          </LabelStat>
        </div>
      {/each}
    </div>
  </Expandable>
</div>
</Modal>