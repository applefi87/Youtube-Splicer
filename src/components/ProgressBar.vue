<template>
  <div class="h-2 bg-gray-300 relative" @click="seek($event)">
    <div class="h-full bg-blue-500" :style="{ width: percent + '%' }"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useClips } from '../stores/clips';

const { clips, current } = useClips();
const percent = ref(0);
let player;

onMounted(() => {
  player = document.querySelector('#player');
  setInterval(() => {
    const clip = clips.value[current.value];
    if (player && clip && player.getCurrentTime) {
      const t = player.getCurrentTime();
      percent.value = ((t - clip.start) / (clip.end - clip.start)) * 100;
    }
  }, 500);
});

function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const clip = clips.value[current.value];
  const sec = clip.start + ratio * (clip.end - clip.start);
  player.seekTo(sec, true);
}
</script>
