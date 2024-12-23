<script lang="ts">
  import type { IconSource } from 'svelte-hero-icons'
  import {
    CheckCircle,
    Fire,
    Icon,
    InformationCircle,
    LockClosed,
    LockOpen,
    Megaphone,
    QuestionMarkCircle,
    Trash,
    UserMinus,
    UserPlus,
    XCircle,
  } from 'svelte-hero-icons'
  import type { ActionName } from './+page.js'

  interface Props {
    action: ActionName;
  }

  let { action }: Props = $props();


  const getAction = (
    action: ActionName
  ): { icon: IconSource; text: string; class: string } => {
    switch (action) {
      case 'ban': {
        return {
          icon: XCircle,
          class: 'text-red-600 dark:text-red-400',
          text: 'Ban (instance)',
        }
      }
      case 'banCommunity': {
        return {
          icon: XCircle,
          class: 'text-red-600 dark:text-red-400',
          text: 'Ban (Community)',
        }
      }
      case 'unban': {
        return {
          icon: CheckCircle,
          class: 'text-green-600 dark:text-green-400',
          text: 'Unban (instance)',
        }
      }
      case 'unbanCommunity': {
        return {
          icon: CheckCircle,
          class: 'text-green-600 dark:text-green-400',
          text: 'Unban (Community)',
        }
      }
      case 'commentRemoval': {
        return {
          icon: Trash,
          class: 'text-red-600 dark:text-red-400',
          text: 'Removal',
        }
      }
      case 'commentRestore': {
        return {
          icon: Trash,
          class: 'text-green-600 dark:text-green-400',
          text: 'Restoration',
        }
      }
      case 'postRemoval': {
        return {
          icon: Trash,
          class: 'text-red-600 dark:text-red-400',
          text: 'Removal',
        }
      }
      case 'postRestore': {
        return {
          icon: Trash,
          class: 'text-green-600 dark:text-green-400',
          text: 'Restoration',
        }
      }
      case 'modAdd': {
        return {
          icon: UserPlus,
          class: 'text-green-600 dark:text-green-400',
          text: 'Added Mod',
        }
      }
      case 'modRemove': {
        return {
          icon: UserMinus,
          class: 'text-red-600 dark:text-red-400',
          text: 'Removed Mod',
        }
      }
      case 'postFeature': {
        return {
          icon: Megaphone,
          class: 'text-green-600 dark:text-green-400',
          text: 'Featured Post',
        }
      }
      case 'postUnfeature': {
        return {
          icon: Megaphone,
          class: 'text-red-600 dark:text-red-400',
          text: 'Unfeatured Post',
        }
      }
      case 'postLock': {
        return {
          icon: LockClosed,
          class: 'text-yellow-600 dark:text-yellow-400',
          text: 'Locked Post',
        }
      }
      case 'postUnlock': {
        return {
          icon: LockOpen,
          class: 'text-yellow-600 dark:text-yellow-400',
          text: 'Unlocked Post',
        }
      }
      case 'purge': {
        return {
          icon: Fire,
          class: 'text-red-600 dark:text-red-400',
          text: 'Purge',
        }
      }
      case 'adminAdd': {
        return {
          icon: UserPlus,
          class: 'text-green-600 dark:text-green-400',
          text: 'Added Admin',
        }
      }
      case 'adminRemove': {
        return {
          icon: UserMinus,
          class: 'text-red-600 dark:text-red-400',
          text: 'Removed Admin',
        }
      }
    }

    return {
      icon: QuestionMarkCircle,
      text: 'Unknown',
      class: '',
    }
  }
  let actionData = $derived(getAction(action))
</script>

<span class="font-bold">
  <span class="flex items-center gap-1 {actionData.class}">
    <Icon src={actionData.icon} size="16" mini class="inline flex-shrink-0" />
    {actionData.text}
  </span>
</span>
