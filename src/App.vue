<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">YouTube Splicer</h1>
    <ClipManager class="mb-4" />
    <Player v-if="clips.length" />
  </div>
</template>

<script setup>
import ClipManager from './components/ClipManager.vue';
import Player from './components/Player.vue';
import { useClips } from './stores/clips';

const { clips } = useClips();
</script>
