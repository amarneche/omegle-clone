<template>
  <div class="relative w-full h-full bg-gray-900">
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    />
    <div 
      v-if="!stream" 
      class="absolute inset-0 flex items-center justify-center text-gray-400"
    >
      Waiting for partner's video...
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

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