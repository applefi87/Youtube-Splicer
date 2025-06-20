<template>
  <div class="h-2 bg-gray-300 relative" @click="seek($event)">
    <div class="h-full bg-blue-500" :style="{ width: percent + '%' }"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, watch } from 'vue';
import { useClips } from '../stores/clips';

const { clips, current } = useClips();
const percent = ref(0);
const player = inject('ytPlayer');
const ready = inject('ytReady');
let timer = null;

function startInterval() {
  if (timer) return;
  timer = setInterval(() => {
    const clip = clips.value[current.value];
    if (player?.value && clip && player.value.getCurrentTime) {
      const t = player.value.getCurrentTime();
      percent.value = ((t - clip.start) / (clip.end - clip.start)) * 100;
    }
  }, 500);
}

onMounted(() => {
  if (ready?.value) {
    startInterval();
  } else if (ready) {
    const stop = watch(
      ready,
      (val) => {
        if (val) {
          startInterval();
          stop();
        }
      },
      { immediate: false }
    );
  }
});

function seek(e) {
  if (!player?.value) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const clip = clips.value[current.value];
  const sec = clip.start + ratio * (clip.end - clip.start);
  player.value.seekTo(sec, true);
}
</script>
