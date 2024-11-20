<template>
  <div class="h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Mobile Header -->
    <header class="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <ChatHeader
          :online-users="onlineUsers"
          :is-settings-open="isSettingsOpen"
          @toggle-settings="isSettingsOpen = !isSettingsOpen"
        />
      </div>
    </header>

    <!-- Main Content -->
    <main class="md:h-screen md:p-4">
      <div class="h-full flex flex-col md:flex-row md:gap-4 md:max-w-7xl md:mx-auto">
        <!-- Left Side - Videos -->
        <div class="relative h-[100vh] md:h-full md:w-1/2 bg-gray-900 md:rounded-xl overflow-hidden">
          <!-- Desktop Header -->
          <div class="hidden md:block absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-gray-900/90 to-transparent">
            <ChatHeader
              :online-users="onlineUsers"
              :is-settings-open="isSettingsOpen"
              @toggle-settings="isSettingsOpen = !isSettingsOpen"
            />
          </div>

          <RemoteVideo
            :stream="webrtcStore.remoteStream"
            :partner-name="partnerName"
          />
          
          <LocalVideo :stream="webrtcStore.localStream" />
        </div>

        <!-- Right Side - Chat & Settings -->
        <div class="hidden md:flex flex-1 flex-col md:relative">
          <SettingsPanel
            v-show="isSettingsOpen"
            :mood="mood"
            @close="isSettingsOpen = false"
          />

          <!-- Chat Area -->
          <div class="flex-1 bg-gray-800/50 rounded-xl p-6">
            <div class="flex-1 overflow-y-auto">
              <div class="text-gray-400 text-center">
                {{ isSearching ? 'Searching for a partner...' : partnerName ? 'Chat started' : 'Click "Find Partner" to start' }}
              </div>
            </div>

            <ChatControls
              :is-camera-on="webrtcStore.isCameraOn"
              :is-mic-on="webrtcStore.isMicOn"
              :is-searching="isSearching"
              @toggle-camera="toggleCamera"
              @toggle-mic="toggleMicrophone"
              @find-partner="findPartner"
              @end-call="endCall"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Controls -->
    <div class="fixed md:hidden bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm">
      <div class="px-4 py-3">
        <ChatControls
          :is-camera-on="webrtcStore.isCameraOn"
          :is-mic-on="webrtcStore.isMicOn"
          :is-searching="isSearching"
          @toggle-camera="toggleCamera"
          @toggle-mic="toggleMicrophone"
          @find-partner="findPartner"
          @end-call="endCall"
          mobile
        />
      </div>
    </div>

    <!-- Mobile Settings Panel -->
    <SettingsPanel
      v-if="isSettingsOpen"
      class="md:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 p-4 overflow-y-auto"
      :mood="mood"
      @close="isSettingsOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useWebRTCStore } from '@/stores/webrtc'
import { useSocketStore } from '@/stores/socket'
import { useSettingsStore } from '@/stores/settings'

// Components
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatControls from '@/components/chat/ChatControls.vue'
import SettingsPanel from '@/components/chat/SettingsPanel.vue'
import RemoteVideo from '@/components/video/RemoteVideo.vue'
import LocalVideo from '@/components/video/LocalVideo.vue'

const router = useRouter()
const webrtcStore = useWebRTCStore()
const socketStore = useSocketStore()
const settingsStore = useSettingsStore()

const isSearching = ref(false)
const partnerName = ref('')
const onlineUsers = ref(0)
const isSettingsOpen = ref(false)
const mood = computed(() => settingsStore.mood)

onMounted(async () => {
  // Initialize WebRTC with PeerJS
  const success = await webrtcStore.initialize()
  if (!success) {
    alert('Failed to access camera/microphone')
    router.push('/')
    return
  }

  setupSocketListeners()
})

onUnmounted(() => {
  webrtcStore.cleanup()
})

const setupSocketListeners = () => {
  socketStore.socket.on('partner-found', async ({ peerId, username }) => {
    try {
      console.log('Partner found:', username, peerId)
      isSearching.value = false
      partnerName.value = username
      currentPartnerId.value = peerId
      
      // Call the peer using PeerJS
      await webrtcStore.callPeer(peerId)
    } catch (error) {
      console.error('Error in partner-found handler:', error)
      endCall()
    }
  })

  socketStore.socket.on('call-ended', (partnerId) => {
    console.log('Call ended by partner:', partnerId)
    endCurrentCall()
    // Automatically start looking for new partner
    findPartner()
  })

  socketStore.socket.on('partner-left', () => {
    console.log('Partner left the chat')
    endCurrentCall()
    // Don't automatically find new partner when partner leaves chat
  })

  socketStore.socket.on('waiting-for-partner', () => {
    console.log('Waiting for partner...')
    isSearching.value = true
  })

  socketStore.socket.on('online-users', (count) => {
    onlineUsers.value = count
  })
}

const currentPartnerId = ref(null)

const findPartner = () => {
  isSearching.value = true
  socketStore.socket.emit('find-partner')
}

const endCall = () => {
  // End call with current partner and look for new one
  socketStore.socket.emit('end-call', currentPartnerId.value)
  endCurrentCall()
  findPartner()
}

const endCurrentCall = () => {
  webrtcStore.cleanup()
  currentPartnerId.value = null
  partnerName.value = ''
}

const toggleCamera = () => {
  webrtcStore.toggleCamera()
}

const toggleMicrophone = () => {
  webrtcStore.toggleMicrophone()
}

onBeforeRouteLeave(() => {
  // Notify server when leaving chat page
  socketStore.socket.emit('leave-chat')
  webrtcStore.cleanup()
})
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
