<template>
  <div>
    <form @submit.prevent="addClip" class="flex items-end space-x-2">
      <div>
        <label class="block text-sm">YouTube URL</label>
        <input v-model="url" type="text" class="border p-1" />
      </div>
      <div>
        <label class="block text-sm">Start (s)</label>
        <input v-model.number="start" type="number" min="1" step="1" class="border p-1 w-20" />
      </div>
      <div>
        <label class="block text-sm">End (s)</label>
        <input v-model.number="end" type="number" min="1" step="1" class="border p-1 w-20" />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-2 py-1">Add</button>
    </form>

  <ul class="mt-4 space-y-2">
      <li
        v-for="(clip, i) in editingClips"
        :key="i"
        class="flex items-center space-x-2 p-1 group hover:bg-gray-100"
        draggable="true"
        @dragstart="dragStart(i)"
        @dragover.prevent
        @drop="drop(i)"
      >
        <span class="cursor-move text-gray-500 group-hover:text-gray-700">&#x2630;</span>
        <img :src="thumb(clip.id)" class="w-20 h-12 object-cover" />
        <input v-model="clip.id" @blur="clip.id = urlToId(clip.id)" class="border p-1 w-28" />
        <label class="text-sm">Start:</label>
        <input v-model.number="clip.start" type="number" min="1" step="1" class="border p-1 w-16" />
        <label class="text-sm">End:</label>
        <input v-model.number="clip.end" type="number" min="1" step="1" :class="['border p-1 w-16', clip.end <= clip.start ? 'border-red-500' : '']" />
        <button @click="removeClip(i)" class="text-red-500">x</button>
      </li>
    </ul>

    <div v-if="editingClips.length" class="mt-2 space-x-2">
      <button @click="applyChanges" :disabled="invalid" class="bg-blue-500 text-white px-2 py-1 disabled:opacity-50">Save</button>
      <button @click="revertChanges" class="bg-gray-300 px-2 py-1">Back</button>
    </div>

    <div v-if="clips.length" class="mt-4 text-sm text-gray-500">
      Playlist changes are encoded into the share link below.
    </div>

    <div v-if="shareUrl" class="mt-2 flex items-center space-x-2">
      <input ref="shareInput" type="text" readonly :value="shareUrl" class="flex-1 border p-1" />
      <button @click="copyLink" class="bg-gray-200 px-2 py-1">Copy</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useClips } from '../stores/clips';
import { storeToRefs } from 'pinia';
import { urlToId } from '../utils/youtube';

const url = ref('');
const start = ref(1);
const end = ref(1);
const clipStore = useClips();
const { clips } = storeToRefs(clipStore);
const { encode, setClips } = clipStore;
const startPlaylist = inject('startPlaylist');
const dragging = ref(null);
const editingClips = ref(JSON.parse(JSON.stringify(clips.value)));
const shareInput = ref(null);

const shareUrl = computed(() => {
  if (!clips.value.length) return '';
  return `${location.origin}${location.pathname}?data=${encode()}`;
});

const invalid = computed(() => {
  return editingClips.value.some(c => c.start < 1 || c.end < 1 || c.end <= c.start);
});

watch(clips, (n) => {
  editingClips.value = JSON.parse(JSON.stringify(n));
});


function thumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function addClip() {
  const id = urlToId(url.value);
  if (id && end.value - start.value >= 1 && end.value > start.value && start.value >= 1 && end.value >= 1) {
    editingClips.value.push({ id, start: start.value, end: end.value });
    url.value = '';
    start.value = 1;
    end.value = 1;
  }
}

function dragStart(i) {
  dragging.value = i;
}

function drop(i) {
  if (dragging.value === null) return;
  const item = editingClips.value.splice(dragging.value, 1)[0];
  editingClips.value.splice(i, 0, item);
  dragging.value = null;
}

function removeClip(i) {
  editingClips.value.splice(i, 1);
}

function copyLink() {
  if (!shareInput.value) return;
  shareInput.value.select();
  document.execCommand('copy');
}

function applyChanges() {
  const cleaned = editingClips.value
    .map(c => ({ id: urlToId(c.id), start: c.start, end: c.end }))
    .filter(c => c.end - c.start >= 1 && c.start >= 1 && c.end >= 1 && c.end > c.start);
  setClips(cleaned);
  editingClips.value = JSON.parse(JSON.stringify(cleaned));
  if (startPlaylist) startPlaylist();
}

function revertChanges() {
  editingClips.value = JSON.parse(JSON.stringify(clips.value));
}

</script>
