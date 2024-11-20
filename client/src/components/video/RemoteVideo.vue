<template>
  <div class="absolute inset-0">
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    ></video>
    <div class="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
      <div class="w-2 h-2 rounded-full bg-green-400"></div>
      <span class="text-white text-sm">{{ partnerName || 'Waiting...' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    videoRef.value.srcObject = newStream
  }
})
</script> 