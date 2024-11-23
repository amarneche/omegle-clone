<template>
  <div class="h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Connection Status -->
    <div 
      v-if="!socketStore.isConnected" 
      class="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center z-50"
    >
      Disconnected from server. Attempting to reconnect...
    </div>

    <!-- Main Content -->
    <main class="h-screen relative">
      <!-- Desktop Layout -->
      <div class="hidden md:flex h-full p-4">
        <div class="flex flex-row gap-4 max-w-7xl mx-auto w-full">
          <!-- Left Side - Videos -->
          <div class="relative w-1/3 flex flex-col bg-gray-900 rounded-xl overflow-hidden">
            <div class="relative grid grid-cols-1 gap-4 p-4">
              <RemoteVideo
                :stream="webrtcStore.remoteStream"
                :partner-name="partnerName"
                class="rounded-md overflow-hidden h-[calc(40vh)]"             
              />
              <LocalVideo 
                :stream="webrtcStore.localStream"    
                class="rounded-md overflow-hidden h-[calc(40vh)]"          
              />
            </div>

            <!-- Video Controls -->
            <div class="p-3 bg-gradient-to-t from-gray-900 to-transparent absolute bottom-0 left-0 right-0">
              <ChatControls
                :is-camera-on="webrtcStore.isCameraOn"
                :is-mic-on="webrtcStore.isMicOn"
                :is-searching="socketStore.isSearching"
                :is-in-call="!!socketStore.currentPartner"
                @toggle-camera="toggleCamera"
                @toggle-mic="toggleMicrophone"
                @start="startChat"
                @end-call="endCall"
                @skip="skipPartner"
              />
            </div>
          </div>

          <!-- Right Side - Chat & Info -->
          <div class="flex-1 flex flex-col bg-gray-800/50 rounded-xl overflow-hidden">
            <div class="p-6 pb-0">
              <ChatHeader
                :online-users="onlineUsers"
                :is-settings-open="isSettingsOpen"
                @toggle-settings="isSettingsOpen = !isSettingsOpen"
              />
              <PartnerInfo
                :partner="socketStore.currentPartner"
                :is-searching="socketStore.isSearching"
              />
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <ChatMessages />
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="md:hidden flex flex-col h-full">
        <!-- Main Content Area -->
        <div class="flex-1 relative">
          <!-- Video Container -->
          <div class="h-full" :class="{ 'h-1/2': activeTab === 'chat' }">
            <div class="relative h-full">
              <RemoteVideo
                :stream="webrtcStore.remoteStream"
                :partner-name="partnerName"
                class="h-full"
              />
              <LocalVideo 
                :stream="webrtcStore.localStream"
                class="absolute bottom-4 right-4 w-24 h-36 rounded-lg overflow-hidden"
              />
            </div>
          </div>

          <!-- Chat/Info Panel (Slides up) -->
          <div 
            v-if="activeTab !== 'video'"
            class="absolute inset-x-0 bottom-0 bg-gray-900/95 backdrop-blur-sm rounded-t-2xl"
            :class="[
              activeTab === 'chat' ? 'h-1/2' : 'h-2/3',
              'transition-all duration-300 ease-out'
            ]"
          >
            <div class="h-full flex flex-col">
              <!-- Pull Handle -->
              <div class="p-2 flex justify-center">
                <div class="w-12 h-1 bg-gray-700 rounded-full"></div>
              </div>

              <!-- Content based on active tab -->
              <div v-if="activeTab === 'chat'" class="flex-1 overflow-hidden">
                <ChatMessages />
              </div>
              <div v-else-if="activeTab === 'info'" class="flex-1 overflow-y-auto p-4">
                <PartnerInfo
                  :partner="socketStore.currentPartner"
                  :is-searching="socketStore.isSearching"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav class="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
          <div class="flex items-center justify-around p-4">
            <button
              @click="activeTab = 'video'"
              class="p-2 rounded-lg transition-colors"
              :class="activeTab === 'video' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400'"
            >
              <Video class="w-6 h-6" />
            </button>
            <button
              @click="activeTab = 'chat'"
              class="p-2 rounded-lg transition-colors"
              :class="activeTab === 'chat' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400'"
            >
              <MessageSquare class="w-6 h-6" />
            </button>
            <button
              @click="activeTab = 'info'"
              class="p-2 rounded-lg transition-colors"
              :class="activeTab === 'info' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400'"
            >
              <Info class="w-6 h-6" />
            </button>
            <button
              @click="isSettingsOpen = true"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-300"
            >
              <Settings class="w-6 h-6" />
            </button>
            <button
              @click="goHome"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-300"
            >
              <Home class="w-6 h-6" />
            </button>
          </div>

          <!-- Video Controls for Mobile -->
          <div class="p-4 border-t border-gray-800">
            <ChatControls
              :is-camera-on="webrtcStore.isCameraOn"
              :is-mic-on="webrtcStore.isMicOn"
              :is-searching="socketStore.isSearching"
              :is-in-call="!!socketStore.currentPartner"
              @toggle-camera="toggleCamera"
              @toggle-mic="toggleMicrophone"
              @start="startChat"
              @end-call="endCall"
              @skip="skipPartner"
              mobile
            />
          </div>
        </nav>
      </div>
    </main>

    <!-- Settings Panel -->
    <Teleport to="body">
      <Transition name="fade">
        <SettingsPanel
          v-if="isSettingsOpen"
          :show="isSettingsOpen"
          :initial-settings="{
            username: settingsStore.username,
            mood: settingsStore.mood,
            preferences: settingsStore.preferences
          }"
          @close="handleSettingsClose"
          @update="handleSettingsUpdate"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useWebRTCStore } from '@/stores/webrtc'
import { useSocketStore } from '@/stores/socket'
import { useSettingsStore } from '@/stores/settings'
import { Home, Settings, MessageSquare, Info, Video } from 'lucide-vue-next'

// Components
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatControls from '@/components/chat/ChatControls.vue'
import SettingsPanel from '@/components/chat/SettingsPanel.vue'
import RemoteVideo from '@/components/video/RemoteVideo.vue'
import LocalVideo from '@/components/video/LocalVideo.vue'
import PartnerInfo from '@/components/chat/PartnerInfo.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'

const router = useRouter()
const webrtcStore = useWebRTCStore()
const socketStore = useSocketStore()
const settingsStore = useSettingsStore()

const isSettingsOpen = ref(false)
const activeTab = ref('video')

// Computed properties
const isSearching = computed(() => socketStore.isSearching)
const onlineUsers = computed(() => socketStore.onlineUsers)
const partnerName = computed(() => socketStore.currentPartner?.username || '')
const mood = computed(() => settingsStore.mood)

// Watch for settings panel state to manage body scroll
watch(isSettingsOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('panel-open')
  } else {
    document.body.classList.remove('panel-open')
  }
})

onMounted(async () => {
  const success = await webrtcStore.initialize()
  if (!success) {
    alert('Failed to access camera/microphone')
    router.push('/')
    return
  }

  socketStore.initializeSocket()
  
  // Start searching with initial user info
  socketStore.startChat({
    username: settingsStore.username,
    mood: settingsStore.mood,
    preferences: settingsStore.preferences
  })

  // Add watchers for partner media status
  watch(() => socketStore.currentPartner, (partner) => {
    if (partner) {
      console.log('Connected to partner:', partner.username)
    }
  })

  // Add handlers for partner media status updates
  socketStore.socket?.on('toggle_camera_status', (status) => {
    if (socketStore.currentPartner) {
      socketStore.currentPartner.isCameraOn = status
    }
  })

  socketStore.socket?.on('toggle_microphone_status', (status) => {
    if (socketStore.currentPartner) {
      socketStore.currentPartner.isMicOn = status
    }
  })
})

onUnmounted(() => {
  socketStore.disconnectCall()
  webrtcStore.cleanup()
  document.body.classList.remove('panel-open')
})

onBeforeRouteLeave(() => {
  socketStore.disconnectCall()
  webrtcStore.cleanup()
})

// Event handlers
const startChat = () => {
  socketStore.startChat({
    username: settingsStore.username,
    mood: settingsStore.mood,
    preferences: settingsStore.preferences,
    peerId: webrtcStore.peerId
  })
}

const endCall = () => {
  socketStore.disconnectCall()
  webrtcStore.cleanup()
}

const skipPartner = () => {
  socketStore.skipPartner()
  webrtcStore.cleanup()
}

const toggleCamera = () => {
  webrtcStore.toggleCamera()
}

const toggleMicrophone = () => {
  webrtcStore.toggleMicrophone()
}

const sendMessage = (message) => {
  socketStore.sendMessage(message)
}

// Settings panel handlers
const handleSettingsClose = () => {
  isSettingsOpen.value = false
}

const handleSettingsUpdate = (newSettings) => {
  // Update all settings at once
  settingsStore.updateAllSettings(newSettings)
  
  // If we're connected to a partner, notify them of the changes
  if (socketStore.currentPartner) {
    socketStore.updateUserInfo({
      ...newSettings,
      type: 'settings_update'
    })
  }
}

const goHome = () => {
  if (confirm('Are you sure you want to leave the chat?')) {
    router.push('/')
  }
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

/* Add transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Add smooth transitions for mobile panels */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
