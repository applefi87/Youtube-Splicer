# YouTube Splicer

YouTube Splicer lets you combine several portions of different YouTube videos and play them back as one. Paste any YouTube link, set the start and end time for each clip and arrange the order. The player will automatically jump from segment to segment so you get a seamless result.

## Usage

1. **Add a clip** – Paste a YouTube URL. The app extracts the video ID and shows a thumbnail preview.
2. **Set the range** – Enter the start and end times in seconds for the portion you want to include.
3. **Arrange clips** – Add as many segments as you like. Drag to reorder or remove items from the list.
4. **Player appears** – Once the first clip is added, a YouTube player shows up below the list.
5. **Play** – Press play to watch the combined result directly in the page.
6. **Share** – Generate a shareable link that encodes your clip list in the URL so others can view the same splice. A short‑link option can be added later.

This project is built with Vite, Vue 3 and Tailwind CSS. Clips are stored in an array using the format:

```jsonc
[
  { "id": "VIDEO_ID", "start": 0, "end": 45 },
  { "id": "ANOTHER_ID", "start": 30, "end": 60 }
]
```

When you click **Share**, this array is encoded (JSON → `id,start,end|…` → Base64) and appended to the URL as `?data=<encoded>`. A short URL service can be added later to map the encoded data to a friendly ID.

### Features

- **Video input and management** – accepts different forms of YouTube URLs and shows thumbnails.
- **Segment selection** – start/end times with validation so end must be greater than start.
- **Playback sequencing** – uses the YouTube Iframe API to queue clips and automatically jump to the next section when one finishes.
- **Progress bar** – displays a bar with markers showing where each segment starts and allows seeking.
- **Sharing** – generates a link containing your clip list so others can view the same splice.

### Development

Install dependencies (requires Node.js) and start the dev server:

```bash
npm install
npm run dev
```

Run `npm run build` to create a production build.

## Project Structure

The repository follows the default Vite layout. The top level contains
`index.html`, this README and config files. All application source files live in
the `src/` directory:

- `main.js` – entry script referenced by `index.html`
- `App.vue` – root component
- `components/` – smaller UI pieces
- `assets/` – CSS and other static files
- `stores/` – Pinia store modules

Keeping the code under `src/` helps separate source from configuration and
build output while still allowing the README to live in the project root.

## Specification Overview

The project implements the features outlined in the original requirements:

- **影片輸入與管理** – paste various YouTube URL formats; the ID is extracted and a thumbnail is shown.
- **區段設定** – start/end inputs with validation and an option to reset to the full video length.
- **播放拼接** – clips play sequentially using the Iframe API.
- **播放控制與進度條標記** – basic controls and a progress bar marked with clip boundaries.
- **預覽縮圖顯示** – video thumbnails appear in the clip list.
- **分享機制** – encoded parameter URLs, with short links available via a simple API.
- **響應式設計** – layout adapts from desktop to mobile.


