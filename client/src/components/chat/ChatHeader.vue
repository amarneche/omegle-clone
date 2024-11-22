<template>
   <div class="flex items-center justify-between gap-4 mb-6">
      <h3  class="text-lg font-semibold text-white flex-1">
       <span v-if="socketStore.currentPartner"> {{ socketStore.currentPartner.username }}</span>
      </h3>
      <div class="flex items-center gap-2">
        <Users class="w-5 h-5 text-green-400" />
        <span class="text-green-400">{{ onlineUsers }} online</span>
      </div>
      <button @click="$emit('toggle-settings')" class="p-2 hover:bg-gray-700 rounded-full transition-colors"
        :class="{ 'bg-gray-700': isSettingsOpen }">
        <Settings class="w-5 h-5 text-white" />
      </button>
    </div>
</template>

<script setup>
import { Users, Settings } from 'lucide-vue-next'
import { useSocketStore } from '@/stores/socket'

const socketStore = useSocketStore()

defineProps({
  onlineUsers: Number,
  isSettingsOpen: Boolean
})

defineEmits(['toggle-settings'])
</script>