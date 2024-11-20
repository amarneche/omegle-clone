<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Header - Visible only on mobile -->
    <header class="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-white">Random Chat</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-green-400" />
            <span class="text-green-400">{{ onlineUsers }} online</span>
          </div>
          <button class="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <Settings class="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="md:h-screen md:p-4">
      <div class="h-full flex flex-col md:flex-row md:gap-4 md:max-w-7xl md:mx-auto">
        <!-- Left Side - Videos (Mobile: Full height, Desktop: 1/3 width) -->
        <div class="relative h-[100vh] md:h-full md:w-1/3 bg-gray-900 md:rounded-xl overflow-hidden">
          <!-- Desktop Header -->
          <div class="hidden md:flex justify-between items-center absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-gray-900/90 to-transparent">
            <h1 class="text-xl font-bold text-white">Random Chat</h1>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <Users class="w-5 h-5 text-green-400" />
                <span class="text-green-400">{{ onlineUsers }} online</span>
              </div>
            </div>
          </div>

          <!-- Remote Video -->
          <div class="absolute inset-0">
            <video
              ref="remoteVideo"
              class="w-full h-full object-cover"
              autoplay
              playsinline
            ></video>
            <div class="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
              <div class="w-2 h-2 rounded-full bg-green-400"></div>
              <span class="text-white text-sm">{{ partnerName || 'Waiting...' }}</span>
            </div>
          </div>

          <!-- Local Video -->
          <div class="absolute bottom-20 md:bottom-4 right-4 w-32 h-48 md:w-40 md:h-56 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref="localVideo"
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
        </div>

        <!-- Right Side - Chat Area (Hidden on mobile, Visible on desktop) -->
        <div class="hidden md:flex flex-1 flex-col bg-gray-800/50 rounded-xl p-6">
          <div class="flex-1 overflow-y-auto">
            <div class="text-gray-400 text-center">
              {{ isSearching ? 'Searching for a partner...' : partnerName ? 'Chat started' : 'Click "Find Partner" to start' }}
            </div>
          </div>

          <!-- Desktop Controls -->
          <div class="mt-4 flex justify-center gap-4">
            <button
              @click="toggleCamera"
              class="p-4 rounded-full transition-colors"
              :class="webrtcStore.isCameraOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
            >
              <Video v-if="webrtcStore.isCameraOn" class="w-6 h-6 text-white" />
              <VideoOff v-else class="w-6 h-6 text-white" />
            </button>

            <button
              @click="toggleMicrophone"
              class="p-4 rounded-full transition-colors"
              :class="webrtcStore.isMicOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
            >
              <Mic v-if="webrtcStore.isMicOn" class="w-6 h-6 text-white" />
              <MicOff v-else class="w-6 h-6 text-white" />
            </button>

            <button
              @click="findPartner"
              class="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full 
                     transition-colors flex items-center gap-2"
              :disabled="isSearching"
            >
              <UserPlus class="w-6 h-6" />
              <span>{{ isSearching ? 'Searching...' : 'Find Partner' }}</span>
            </button>

            <button
              @click="endCall"
              class="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneOff class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Control Bar -->
    <div class="fixed md:hidden bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm">
      <div class="px-4 py-3">
        <div class="flex justify-center gap-3">
          <button
            @click="toggleCamera"
            class="p-3 rounded-full transition-colors"
            :class="webrtcStore.isCameraOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
          >
            <Video v-if="webrtcStore.isCameraOn" class="w-5 h-5 text-white" />
            <VideoOff v-else class="w-5 h-5 text-white" />
          </button>

          <button
            @click="toggleMicrophone"
            class="p-3 rounded-full transition-colors"
            :class="webrtcStore.isMicOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'"
          >
            <Mic v-if="webrtcStore.isMicOn" class="w-5 h-5 text-white" />
            <MicOff v-else class="w-5 h-5 text-white" />
          </button>

          <button
            @click="findPartner"
            class="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full 
                   transition-colors flex items-center gap-2"
            :disabled="isSearching"
          >
            <UserPlus class="w-5 h-5" />
            <span class="text-sm">{{ isSearching ? 'Searching...' : 'Find' }}</span>
          </button>

          <button
            @click="endCall"
            class="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <PhoneOff class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users,
  UserPlus,
  PhoneOff
} from 'lucide-vue-next'
import { useWebRTCStore } from '../stores/webrtc'
import { useSocketStore } from '../stores/socket'
import { useRouter } from 'vue-router'

const router = useRouter()
const webrtcStore = useWebRTCStore()
const socketStore = useSocketStore()

const localVideo = ref(null)
const remoteVideo = ref(null)
const isSearching = ref(false)
const partnerName = ref('')
const onlineUsers = ref(0)

onMounted(async () => {
  const success = await webrtcStore.initializeMedia()
  if (!success) {
    alert('Failed to access camera/microphone')
    router.push('/')
    return
  }

  if (localVideo.value) {
    localVideo.value.srcObject = webrtcStore.localStream
  }

  setupSocketListeners()
})

onUnmounted(() => {
  webrtcStore.cleanup()
})

watch(() => webrtcStore.remoteStream, (newStream) => {
  if (remoteVideo.value && newStream) {
    remoteVideo.value.srcObject = newStream
  }
})

const setupSocketListeners = () => {
  socketStore.socket.on('partner-found', async ({ partnerId, username }) => {
    try {
      isSearching.value = false
      partnerName.value = username
      await webrtcStore.createPeerConnection(partnerId)
      const offer = await webrtcStore.createOffer()
      socketStore.socket.emit('offer', { offer, to: partnerId })
    } catch (error) {
      console.error('Error in partner-found handler:', error)
      endCall()
    }
  })

  socketStore.socket.on('offer', async ({ offer, from }) => {
    try {
      await webrtcStore.createPeerConnection(from)
      const answer = await webrtcStore.handleOffer(offer)
      socketStore.socket.emit('answer', { answer, to: from })
    } catch (error) {
      console.error('Error in offer handler:', error)
      endCall()
    }
  })

  socketStore.socket.on('answer', async ({ answer, from }) => {
    try {
      await webrtcStore.handleAnswer(answer)
    } catch (error) {
      console.error('Error in answer handler:', error)
      endCall()
    }
  })

  socketStore.socket.on('ice-candidate', async ({ candidate, from }) => {
    try {
      await webrtcStore.handleIceCandidate(candidate)
    } catch (error) {
      console.error('Error in ice-candidate handler:', error)
    }
  })

  socketStore.socket.on('online-users', (count) => {
    onlineUsers.value = count
  })

  socketStore.socket.on('call-ended', () => {
    endCall()
  })
}

const findPartner = () => {
  isSearching.value = true
  socketStore.socket.emit('find-partner')
}

const endCall = () => {
  webrtcStore.cleanup()
  socketStore.socket.emit('end-call')
  partnerName.value = ''
  isSearching.value = false
}

const toggleCamera = () => {
  webrtcStore.toggleCamera()
}

const toggleMicrophone = () => {
  webrtcStore.toggleMicrophone()
}
</script>

<style scoped>
.mirror {
  transform: scaleX(-1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease;
}
</style>
