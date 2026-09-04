# Clippo: The All-in-One Short-Form Video Trimmer & Splitter

Clippo is a modern web application built with **Astro, React, and DaisyUI** to simplify preparing videos for social media platforms like **WhatsApp Status, TikTok, Instagram Reels, and YouTube Shorts**. It empowers users to effortlessly upload, trim, and split videos directly in their browser—with zero backend overhead or software installation required.

---

## Why Clippo?

Sharing long videos across social platforms often comes with strict clip length limits, varying aspect ratios, and format constraints. Clippo was born out of the need for a seamless, client-side solution that handles these limitations automatically. By performing all processing locally in the browser, Clippo keeps your media completely private, fast, and accessible on any device.

---

## Key Features

* **Effortless Video Upload**: Supports all popular video formats (MP4, MOV, WebM, AVI, etc.) with a simple drag-and-drop interface and instant live previews.
* **Intuitive Trimming Controls**: Precise timeline controls let you set custom start and end points using a familiar, mobile-friendly interface.
* **Multi-Platform Auto-Splitting**: Split long videos into equal, sequential segments tailored to platform-specific story and status limits:
* **WhatsApp Status**: 60-second or legacy 30-second segments.
* **Instagram Stories & Reels**: 15, 30, or 60-second clips.
* **TikTok & YouTube Shorts**: Custom time splits optimized for quick uploads.


* **One-Click ZIP Downloads**: Export all generated clips individually or bundle them all into a single **ZIP archive** for effortless bulk downloading.
* **Asynchronous Processing**: Powered by **@ffmpeg/ffmpeg** and **Web Workers**, video rendering happens asynchronously on your local machine. Your browser UI remains fully responsive, even when processing large files.
* **Privacy-First (100% Client-Side)**: Your videos never leave your device. No cloud uploads, server storage, or privacy risks.

---

## Technical Stack

* **Core Framework**: Astro (Multi-Page Architecture / Islands Architecture)
* **UI Components**: React + DaisyUI (Tailwind CSS)
* **Video Engine**: @ffmpeg/ffmpeg (WebAssembly)
* **Archive Utility**: JSZip (for client-side ZIP generation)
* **State Management**: React Hooks (`useState`, `useRef`, `useContext`)
* **Concurrency**: Web Workers for multi-threaded background processing

---

Clippo is the ultimate utility for content creators, social media managers, and everyday users who want to repurpose long video content into platform-ready short clips without complex editing software.