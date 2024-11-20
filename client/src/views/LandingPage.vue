<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="p-4 bg-blue-500 rounded-full">
            <Video class="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 class="text-4xl font-bold text-white mb-2">Random Chat</h1>
        <p class="text-gray-400">Meet new people through video chat</p>
      </div>

      <!-- Main Card -->
      <div class="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm shadow-xl">
        <!-- Online Users Counter -->
        <div class="flex items-center justify-center gap-2 mb-6 text-green-400">
          <Users class="w-5 h-5" />
          <span>{{ onlineUsers }} people online</span>
        </div>

        <!-- Name Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Your Display Name</label>
          <div class="relative">
            <input 
              v-model="username"
              type="text"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name (optional)"
            >
            <User class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <!-- Start Button -->
        <button
          @click="startChat"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg
                 flex items-center justify-center gap-2 transition-all duration-300
                 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus class="w-5 h-5" />
          Start Random Chat
        </button>

        <!-- Guidelines -->
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-2 text-gray-400">
            <Camera class="w-4 h-4" />
            <span class="text-sm">Camera and microphone required</span>
          </div>
          <div class="flex items-center gap-2 text-gray-400">
            <Shield class="w-4 h-4" />
            <span class="text-sm">No registration needed</span>
          </div>
          <div class="flex items-center gap-2 text-gray-400">
            <Heart class="w-4 h-4" />
            <span class="text-sm">Free to use</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Video, 
  UserPlus, 
  Users, 
  User,
  Camera,
  Shield,
  Heart
} from 'lucide-vue-next'
import { useSocketStore } from '../stores/socket'

const router = useRouter()
const socketStore = useSocketStore()
const username = ref('')
const onlineUsers = ref(0)

onMounted(() => {
  socketStore.socket.on('online-users', (count) => {
    onlineUsers.value = count
  })
})

const startChat = () => {
  socketStore.setUsername(username.value || generateRandomName())
  router.push('/chat')
}

const generateRandomName = () => {
  const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Swift', 'Kind', 'Brave']
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear']
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${randomAdjective}${randomNoun}`
}
</script>

<style scoped>
/* Add a subtle pulse animation to the start button on hover */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

button:hover {
  animation: pulse 2s infinite;
}
</style> 