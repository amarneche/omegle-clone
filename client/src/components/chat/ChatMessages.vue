<template>
  <div class="flex flex-col h-full">
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar"
    >
      <div v-if="!socketStore.currentPartner" class="flex items-center justify-center h-full">
        <div class="text-gray-400 text-center">
            
          <Search class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{{ socketStore.isSearching ? 'Looking for someone to chat with...' : 'Start a chat to begin messaging' }}</p>
        </div>
      </div>

      <template v-else>
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex flex-col"
          :class="[message.isSelf ? 'items-end' : 'items-start']"
        >
          <div class="flex items-end gap-2 max-w-[80%]">
            <div
              class="px-4 py-2 rounded-2xl text-sm"
              :class="[
                message.isSelf 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-700 text-gray-100 rounded-bl-sm'
              ]"
            >
              {{ message.text }}
            </div>
          </div>
          <span class="text-xs text-gray-500 mt-1">
            {{ message.isSelf ? 'You' : socketStore.currentPartner.username }} • {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </template>
    </div>

    <ChatInput 
      v-if="socketStore.currentPartner"
      @send="sendMessage"
      :disabled="!socketStore.currentPartner"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSocketStore } from '@/stores/socket'
import ChatInput from './ChatInput.vue'
import { Search } from 'lucide-vue-next';

const socketStore = useSocketStore()
const messagesContainer = ref(null)
const messages = ref([])

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(timestamp)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = (text) => {
  if (!text.trim()) return
  
  const newMessage = {
    id: Date.now(),
    text,
    timestamp: new Date(),
    isSelf: true
  }
  
  messages.value.push(newMessage)
  socketStore.sendMessage(text)
  scrollToBottom()
}

// Watch for new partner to clear messages
watch(() => socketStore.currentPartner, (newPartner) => {
  if (!newPartner) {
    messages.value = []
  }
})

onMounted(() => {
  // Listen for incoming messages
  socketStore.socket?.on('message_received', (message) => {
    messages.value.push({
      id: Date.now(),
      text: message.text,
      timestamp: new Date(),
      isSelf: false
    })
    scrollToBottom()
  })
})
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
</style> 