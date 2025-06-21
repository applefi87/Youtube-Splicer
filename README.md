# YouTube Splicer

YouTube Splicer lets you combine several portions of different YouTube videos and play them back as one. Paste a YouTube link, set start and end times for each clip and arrange the order. The player automatically jumps from segment to segment. It uses two hidden YouTube iframes to preload the next clip for a smooth handoff. Press **Play** to start the sequence. On wide screens the player appears to the left with the clip list on the right, while on mobile the list drops below the player.

## Usage

1. **Add a clip** – Paste a YouTube URL or just the ID. The app extracts the ID automatically and shows a thumbnail preview.
2. **Set the range** – Enter start and end times in seconds. Both must be at least 1 and the end must exceed the start by at least one second.
3. **Arrange clips** – Add as many segments as you like. Each entry shows editable ID, start and end fields. Drag the icon to reorder or remove items. Use **Save** to apply changes or **Back** to restore the current playlist.
4. **Player at the top** – The page always displays a player area above the list. It stays empty until you add the first clip.
5. **Play** – Use the Play button to watch the combined result or Pause to stop. Skip forward or back with Next/Prev buttons. Dragging the progress handle pauses playback; press **Play** again to continue from that spot. The bar displays clip boundaries, a red dot and a thumbnail preview while seeking. If you scrub the built‑in YouTube bar, the custom progress pauses and resumes automatically once the video starts playing again.
6. **Share** – A readonly input field with a copy button encodes your clips into the URL. A short‑link option can be added later.

This project is built with Vite, Vue 3 and Tailwind CSS. Clips are stored in an array using the format:

```jsonc
[
  { "id": "VIDEO_ID", "start": 0, "end": 45 },
  { "id": "ANOTHER_ID", "start": 30, "end": 60 }
]
```

When you click **Share**, this array is encoded (JSON → `id,start,end|…` → Base64) and appended to the URL as `?data=<encoded>`. A short URL service can be added later to map the encoded data to a friendly ID.

### Features

- **Video input and management** – accepts URLs or IDs, automatically stores only the ID and shows thumbnails.
- **Segment selection** – start/end fields require a minimum of one second and the end must be greater than the start.
- **Playback sequencing** – uses the YouTube Iframe API to queue clips and automatically jump to the next section when one finishes.
- **Progress bar** – displays progress across the full playlist with segment markers, a draggable handle and thumbnail preview.
- **Skip controls** – Next and Prev buttons jump between clips. The Prev button resets the current clip on first press and moves back if pressed again within two seconds.
- **Custom progress** – the bar pauses when the YouTube progress is dragged so manual seeking doesn't affect splice playback and resumes once the video plays.
- **Save or revert** – edit clips freely and press **Save** to restart the playlist or **Back** to discard changes.
- **Sharing** – generates a link containing your clip list so others can view the same splice or load it directly.
- **Drag to reorder** – rearrange clips in the list using standard drag-and-drop.

### Development

Install dependencies (requires Node.js) and start the dev server:

```bash
npm install
npm run dev
```

Run `npm run build` to create a production build.

> **Note**
> The player loads the YouTube Iframe API from `youtube.com`. Make sure your
> network connection allows access to that domain or the videos will not play.

## Project Structure

The repository follows the default Vite layout. The top level contains
`index.html`, this README and config files. All application source files live in
the `src/` directory:

- `main.js` – entry script referenced by `index.html`
- `App.vue` – root component
- `components/` – smaller UI pieces
- `assets/` – CSS and other static files
- `stores/` – Pinia store modules
- `utils/` – helpers such as `youtube.js` for converting between URLs and video IDs

Keeping the code under `src/` helps separate source from configuration and
build output while still allowing the README to live in the project root.

## Specification Overview

The project implements the features outlined in the original requirements:

- **影片輸入與管理** – paste various YouTube URL formats; the ID is extracted and a thumbnail is shown.
- **區段設定** – start/end inputs with validation and an option to reset to the full video length.
- **播放拼接** – clips play sequentially using the Iframe API.
- **播放控制與進度條標記** – basic controls with a progress bar, draggable handle and thumbnail preview.
- **預覽縮圖顯示** – video thumbnails appear in the clip list.
- **分享機制** – encoded parameter URLs, with short links available via a simple API.
- **響應式設計** – layout adapts from desktop to mobile.


A simple standalone demo is available in demo.html for quickly testing the YouTube Iframe API.
