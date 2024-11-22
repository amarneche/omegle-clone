<template>
  <div class="relative w-full h-full bg-gray-900 border-b border-gray-800">
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    />
    
    <!-- Overlay for partner name and status -->
    <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-900/90 to-transparent">
      <div class="flex items-center justify-between text-white">
        <span class="font-medium">{{ partnerName || 'Partner' }}</span>
        <div v-if="!stream" class="flex items-center text-sm text-gray-400">
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </div>
      </div>
    </div>

    <!-- No Video Placeholder -->
    <div 
      v-if="!stream" 
      class="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-800/50 backdrop-blur-sm"
    >
      <div class="text-center">
        <UserSquare2 class="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Waiting for partner's video...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Loader2, UserSquare2 } from 'lucide-vue-next'

const props = defineProps({
  stream: {
    type: MediaStream,
    default: null
  },
  partnerName: {
    type: String,
    default: ''
  }
})

const videoRef = ref(null)

watch(() => props.stream, (newStream) => {
  if (videoRef.value && newStream) {
    console.log('Setting remote video stream')
    videoRef.value.srcObject = newStream
  }
}, { immediate: true })

onMounted(() => {
  if (videoRef.value && props.stream) {
    console.log('Setting initial remote video stream')
    videoRef.value.srcObject = props.stream
  }
})
</script> 