<template>
  <div class="flex justify-center gap-4">
    <button
      @click="$emit('toggle-camera')"
      class="p-4 rounded-full transition-colors"
      :class="isCameraOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
      :disabled="!isActive"
    >
      <Video v-if="isCameraOn" class="w-6 h-6 text-white" />
      <VideoOff v-else class="w-6 h-6 text-white" />
    </button>

    <button
      @click="$emit('toggle-mic')"
      class="p-4 rounded-full transition-colors"
      :class="isMicOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
      :disabled="!isActive"
    >
      <Mic v-if="isMicOn" class="w-6 h-6 text-white" />
      <MicOff v-else class="w-6 h-6 text-white" />
    </button>

    <button
      @click="handleMainAction"
      class="px-6 py-4 text-white rounded-full transition-colors flex items-center gap-2"
      :class="mainButtonClass"
      :disabled="isSearching"
    >
      <component :is="mainButtonIcon" class="w-6 h-6" :class="{ 'animate-pulse': isSearching }" />
      <span>{{ mainButtonText }}</span>
    </button>

    <button
      v-if="isInCall"
      @click="$emit('skip')"
      class="p-4 rounded-full transition-colors bg-yellow-500 hover:bg-yellow-600"
      title="Skip Partner"
    >
      <SkipForward class="w-6 h-6 text-white" />
    </button>
  </div>
</template>

<script setup>
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  UserPlus, 
  PhoneOff, 
  Search, 
  StopCircle,
  SkipForward 
} from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  isCameraOn: Boolean,
  isMicOn: Boolean,
  isSearching: Boolean,
  isInCall: Boolean,
})

const emit = defineEmits([
  'toggle-camera', 
  'toggle-mic', 
  'start', 
  'end-call', 
  'skip'
])

// Computed properties
const isActive = computed(() => props.isInCall || props.isSearching)

const mainButtonText = computed(() => {
  if (props.isSearching) return 'Searching...'
  if (props.isInCall) return 'End Call'
  return 'Start Chat'
})

const mainButtonIcon = computed(() => {
  if (props.isSearching) return Search
  if (props.isInCall) return PhoneOff
  return UserPlus
})

const mainButtonClass = computed(() => {
  if (props.isSearching) return 'bg-yellow-500 cursor-not-allowed'
  if (props.isInCall) return 'bg-red-500 hover:bg-red-600'
  return 'bg-green-500 hover:bg-green-600'
})

// Methods
const handleMainAction = () => {
  if (props.isSearching) return
  if (props.isInCall) {
    emit('end-call')
  } else {
    emit('start')
  }
}
</script> 