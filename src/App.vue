<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">YouTube Splicer</h1>
    <div class="flex flex-col md:flex-row">
      <div class="md:w-2/3">
        <Player ref="playerRef" />
      </div>
      <div class="md:w-1/3 md:pl-4 mt-4 md:mt-0">
        <ClipManager />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ClipManager from './components/ClipManager.vue'
import Player from './components/Player.vue'

const playerRef = ref(null)
function restart() {
  playerRef.value?.startPlaylist()
}
provide('startPlaylist', restart)
</script>
