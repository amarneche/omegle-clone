<template>
  <div class="h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Main Content -->
    <main class="h-screen p-4">
      <div class="h-full flex flex-col md:flex-row md:gap-4 md:max-w-7xl md:mx-auto">
        <!-- Left Side - Videos -->
        <div class="relative md:w-1/3 flex flex-col bg-gray-900 md:rounded-xl overflow-hidden">
          <!-- Videos Stack -->
          <div class="relative grid grid-cols-1 gap-4 p-4">
            <!-- Remote Video -->
            <RemoteVideo
              :stream="webrtcStore.remoteStream"
              :partner-name="partnerName"
              class="rounded-md overflow-hidden h-[calc(40vh)]"             
            />
            <!-- Local Video -->
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

        <!-- Right Side - Chat & Settings -->
        <div class="hidden md:flex flex-1 flex-col md:relative bg-gray-800/50 rounded-xl overflow-hidden">
          <div class="p-6 pb-0">
            <ChatHeader
              :online-users="onlineUsers"
              :is-settings-open="isSettingsOpen"
              @toggle-settings="isSettingsOpen = !isSettingsOpen"
            />
            

          </div>

          <!-- Chat Messages and Input -->
          <div class="flex-1 flex flex-col min-h-0">
            <ChatMessages />
          </div>
        </div>
      </div>
    </main>


    <!-- Settings Panel with Teleport -->
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
</style>
