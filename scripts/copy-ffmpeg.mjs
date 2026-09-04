import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve("node_modules/@ffmpeg/core/dist/esm");
const destDir = path.resolve("public/ffmpeg");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = ["ffmpeg-core.js", "ffmpeg-core.wasm", "ffmpeg-core.worker.js"];

files.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[FFmpeg Copy] Successfully copied ${file} -> public/ffmpeg/`);
  }
});
