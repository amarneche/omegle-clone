<template>
  <div class="flex justify-between items-center">
    <h1 class="text-xl font-bold text-white">Random Chat</h1>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Users class="w-5 h-5 text-green-400" />
        <span class="text-green-400">{{ onlineUsers }} online</span>
      </div>
      <button 
        @click="$emit('toggle-settings')"
        class="p-2 hover:bg-gray-700 rounded-full transition-colors"
        :class="{ 'bg-gray-700': isSettingsOpen }"
      >
        <Settings class="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Users, Settings } from 'lucide-vue-next'

defineProps({
  onlineUsers: Number,
  isSettingsOpen: Boolean
})

defineEmits(['toggle-settings'])
</script> 