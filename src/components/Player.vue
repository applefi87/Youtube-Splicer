<template>
  <div>
    <div id="player" class="w-full aspect-video mb-2"></div>
    <ProgressBar />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ProgressBar from './ProgressBar.vue';
import { useClips } from '../stores/clips';

const { clips, current, next } = useClips();
let player;

function loadScript() {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onload = () => resolve();
      document.body.appendChild(tag);
    }
  });
}

function initPlayer() {
  player = new window.YT.Player('player', {
    height: '360',
    width: '640',
    videoId: clips.value[0]?.id,
    playerVars: { controls: 0 },
    events: {
      onReady: onReady,
      onStateChange: onStateChange,
    },
  });
}

function onReady() {
  playClip(0);
}

function playClip(index) {
  const clip = clips.value[index];
  if (!clip) return;
  player.loadVideoById({
    videoId: clip.id,
    startSeconds: clip.start,
    endSeconds: clip.end,
  });
  current.value = index;
}

function onStateChange(e) {
  if (e.data === window.YT.PlayerState.ENDED) {
    const nextIndex = current.value + 1;
    if (nextIndex < clips.value.length) {
      playClip(nextIndex);
    }
  }
}

onMounted(async () => {
  await loadScript();
  initPlayer();
});
</script>
