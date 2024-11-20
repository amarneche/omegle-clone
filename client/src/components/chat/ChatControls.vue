<template>
  <div class="flex justify-center gap-4">
    <button
      @click="$emit('toggle-camera')"
      class="p-4 rounded-full transition-colors"
      :class="isCameraOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
    >
      <Video v-if="isCameraOn" class="w-6 h-6 text-white" />
      <VideoOff v-else class="w-6 h-6 text-white" />
    </button>

    <button
      @click="$emit('toggle-mic')"
      class="p-4 rounded-full transition-colors"
      :class="isMicOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
    >
      <Mic v-if="isMicOn" class="w-6 h-6 text-white" />
      <MicOff v-else class="w-6 h-6 text-white" />
    </button>

    <button
      @click="$emit('find-partner')"
      class="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full 
             transition-colors flex items-center gap-2"
      :disabled="isSearching"
    >
      <UserPlus class="w-6 h-6" />
      <span>{{ isSearching ? 'Searching...' : 'Find Partner' }}</span>
    </button>

    <button
      @click="$emit('end-call')"
      class="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
    >
      <PhoneOff class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup>
import { Video, VideoOff, Mic, MicOff, UserPlus, PhoneOff } from 'lucide-vue-next'

defineProps({
  isCameraOn: Boolean,
  isMicOn: Boolean,
  isSearching: Boolean
})

defineEmits(['toggle-camera', 'toggle-mic', 'find-partner', 'end-call'])
</script> 