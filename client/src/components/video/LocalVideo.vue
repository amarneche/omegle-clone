<template>
  <div class="absolute bottom-20 md:bottom-4 right-4 w-32 h-48 md:w-40 md:h-56 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
    <video
      ref="videoRef"
      class="w-full h-full object-cover mirror"
      autoplay
      muted
      playsinline
    ></video>
    <div class="absolute top-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-full">
      <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
      <span class="text-white text-xs">You</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  stream: {
    type: MediaStream,
    default: null
  }
})

const videoRef = ref(null)

watch(() => props.stream, (newStream) => {
  if (videoRef.value && newStream) {
    videoRef.value.srcObject = newStream
  }
})
</script>

<style scoped>
.mirror {
  transform: scaleX(-1);
}
</style> 