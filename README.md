# Clippo: The All-in-One Video Trimming Tool for WhatsApp

Clippo is a modern, single-page web application designed to simplify the process of preparing videos for sharing on WhatsApp. Built with **React** and **Chakra UI**, this tool empowers users to effortlessly upload, trim, and split videos directly in their browser, with no backend or software installation required.

---

## Why Clippo?

Sharing videos on WhatsApp Status often comes with strict limitations on length and file format. Clippo was born out of the need for a seamless, client-side solution that handles these constraints automatically. The application is built to be fast, reliable, and user-friendly, ensuring that anyone can prepare their videos for sharing in just a few clicks.

---

## Key Features

* **Effortless Video Upload**: Clippo supports all popular video formats (MP4, MOV, WebM, etc.) and provides a simple drag-and-drop interface for quick uploading. A live preview of the video is displayed immediately after a file is selected.
* **Intuitive Trimming Controls**: The interactive timeline allows for precise control over the video content. Users can easily set custom start and end points for their videos, replicating the familiar trimming experience found in popular mobile apps.
* **WhatsApp-Ready Splitting**: The core functionality of Clippo is its ability to automatically split longer videos into multiple segments that are compatible with WhatsApp Status. It adheres to the 60-second limit and can be easily configured to handle the older 30-second limit for maximum compatibility.
* **Asynchronous Processing**: Powered by the **@ffmpeg/ffmpeg** library and **Web Workers**, all video processing is performed asynchronously on the client's machine. This means the browser's UI remains responsive and functional, even when handling large video files.
* **Seamless Downloads**: After processing, Clippo provides direct download links for each trimmed segment, ensuring that the files are ready to be shared instantly on WhatsApp Status. The output is optimized for WhatsApp's supported formats, including MP4 and 3GP.

---

## Technical Stack

* **Frontend**: React
* **UI Framework**: Chakra UI
* **Core Library**: @ffmpeg/ffmpeg
* **State Management**: React Hooks (useState, useRef)
* **Styling**: Chakra UI's component-based styling and responsive design utilities.

Clippo is the perfect tool for content creators, social media enthusiasts, or anyone who wants to quickly and efficiently share their favorite video moments without hassle.