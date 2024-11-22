<template>
  <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
    <div v-if="partner" class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">
          {{ partner.username }}
        </h3>
        <div class="flex items-center gap-2">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="partnerMediaClass"
          >
            {{ partnerMediaStatus }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-2 text-gray-300 text-sm">
        <span class="flex items-center gap-1">
          <Video v-if="partner.isCameraOn" class="w-4 h-4" />
          <VideoOff v-else class="w-4 h-4 text-gray-500" />
        </span>
        <span class="flex items-center gap-1">
          <Mic v-if="partner.isMicOn" class="w-4 h-4" />
          <MicOff v-else class="w-4 h-4 text-gray-500" />
        </span>
      </div>

      <div class="mt-3">
        <div class="text-sm text-gray-400">Mood</div>
        <div class="flex items-center gap-2 mt-1">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300"
          >
            {{ partner.mood.type }}
          </span>
          <span 
            v-if="partner.mood.subject"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300"
          >
            {{ partner.mood.subject }}
          </span>
        </div>
      </div>

      <div v-if="partner.preferences?.language" class="mt-2">
        <div class="text-sm text-gray-400">Language</div>
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300"
        >
          {{ partner.preferences.language }}
        </span>
      </div>
    </div>

    <div v-else class="text-center text-gray-400">
      {{ isSearching ? 'Looking for a partner...' : 'No partner connected' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Video, VideoOff, Mic, MicOff } from 'lucide-vue-next'

const props = defineProps({
  partner: {
    type: Object,
    default: null
  },
  isSearching: {
    type: Boolean,
    default: false
  }
})

const partnerMediaStatus = computed(() => {
  if (!props.partner) return ''
  if (props.partner.isCameraOn && props.partner.isMicOn) return 'All Media On'
  if (!props.partner.isCameraOn && !props.partner.isMicOn) return 'All Media Off'
  return 'Partial Media'
})

const partnerMediaClass = computed(() => {
  if (!props.partner) return ''
  if (props.partner.isCameraOn && props.partner.isMicOn) {
    return 'bg-green-500/20 text-green-300'
  }
  if (!props.partner.isCameraOn && !props.partner.isMicOn) {
    return 'bg-red-500/20 text-red-300'
  }
  return 'bg-yellow-500/20 text-yellow-300'
})
</script> 