<template>
  <div>
    <form @submit.prevent="addClip" class="flex items-end space-x-2">
      <div>
        <label class="block text-sm">YouTube URL</label>
        <input v-model="url" type="text" class="border p-1" />
      </div>
      <div>
        <label class="block text-sm">Start (s)</label>
        <input v-model.number="start" type="number" class="border p-1 w-20" />
      </div>
      <div>
        <label class="block text-sm">End (s)</label>
        <input v-model.number="end" type="number" class="border p-1 w-20" />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-2 py-1">Add</button>
    </form>

  <ul class="mt-4 space-y-2">
      <li
        v-for="(clip, i) in clips"
        :key="i"
        class="flex items-center space-x-2"
        draggable="true"
        @dragstart="dragStart(i)"
        @dragover.prevent
        @drop="drop(i)"
      >
        <img :src="thumb(clip.id)" class="w-20 h-12 object-cover" />
        <span class="flex-1">{{ clip.id }} [{{ clip.start }}-{{ clip.end }}]</span>
        <button @click="remove(i)" class="text-red-500">x</button>
      </li>
    </ul>

    <div v-if="shareUrl" class="mt-4 flex items-center space-x-2">
      <input ref="shareInput" type="text" readonly :value="shareUrl" class="flex-1 border p-1" />
      <button @click="copyLink" class="bg-gray-200 px-2 py-1">Copy</button>
      <button @click="saveLocal" class="bg-green-500 text-white px-2 py-1">Save</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useClips } from '../stores/clips';
import { storeToRefs } from 'pinia';

const url = ref('');
const start = ref(0);
const end = ref(0);
const clipStore = useClips();
const { clips } = storeToRefs(clipStore);
const { add, remove, move, encode, saveLocal: saveToLocal } = clipStore;
const dragging = ref(null);
const shareInput = ref(null);

const shareUrl = computed(() => {
  if (!clips.value.length) return '';
  return `${location.origin}${location.pathname}?data=${encode()}`;
});

function extractId(link) {
  try {
    const u = new URL(link);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v');
    }
    const parts = u.pathname.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    return '';
  }
}

function thumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function addClip() {
  const id = extractId(url.value);
  if (id && end.value > start.value) {
    add({ id, start: start.value, end: end.value });
    url.value = '';
    start.value = 0;
    end.value = 0;
  }
}

function dragStart(i) {
  dragging.value = i;
}

function drop(i) {
  if (dragging.value === null) return;
  move(dragging.value, i);
  dragging.value = null;
}

function copyLink() {
  if (!shareInput.value) return;
  shareInput.value.select();
  document.execCommand('copy');
}

function saveLocal() {
  saveToLocal();
  alert('Playlist saved');
}
</script>
