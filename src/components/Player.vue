<template>
  <div>
    <div id="player" class="w-full aspect-video mb-2"></div>
    <div class="mb-2">
      <button
        @click="togglePlay"
        class="px-3 py-1 bg-green-500 text-white rounded"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
    <ProgressBar />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, provide } from 'vue';
import ProgressBar from './ProgressBar.vue';
import { useClips } from '../stores/clips';

const { clips, current, next } = useClips();
const player = ref(null);
const isReady = ref(false);
const isPlaying = ref(false);
provide('ytPlayer', player);

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
  player.value = new window.YT.Player('player', {
    height: '360',
    width: '640',
    playerVars: { controls: 0 },
    events: {
      onReady,
      onStateChange,
    },
  });
}

function onReady() {
  isReady.value = true;
  if (clips.value.length) {
    playClip(0);
  }
}

function playClip(index) {
  current.value = index;
  if (!isReady.value || !player.value) return;

  const clip = clips.value[index];
  if (!clip) return;

  player.value.cueVideoById({
    videoId: clip.id,
    startSeconds: clip.start,
    endSeconds: clip.end,
  });

  if (isPlaying.value) {
    player.value.playVideo();
  }
}

function onStateChange(e) {
  if (e.data === window.YT.PlayerState.ENDED) {
    const nextIndex = current.value + 1;
    if (nextIndex < clips.value.length) {
      playClip(nextIndex);
    }
  }
}

function togglePlay() {
  if (!player.value) return;
  if (isPlaying.value) {
    player.value.pauseVideo();
    isPlaying.value = false;
  } else {
    player.value.playVideo();
    isPlaying.value = true;
  }
}

watch(clips, (newClips, oldClips) => {
  if (isReady.value && !oldClips.length && newClips.length) {
    playClip(0);
  }
});

onMounted(async () => {
  await loadScript();
  initPlayer();
});
</script>
