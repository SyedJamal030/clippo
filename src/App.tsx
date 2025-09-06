// // src/App.tsx
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//   Box,
//   Heading,
//   Container,
//   VStack,
//   Button,
//   Text,
//   Link,
// } from "@chakra-ui/react";
// import VideoUploader from "./VideoUploader";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile, toBlobURL } from "@ffmpeg/util";
// import { Download } from "lucide-react";
// import { Progress } from "./Progress";
// // import Timeline from './components/Timeline'; // A hypothetical timeline component

// const FFMPEG_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm";
// const App: React.FC = () => {

//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [videoSrc, setVideoSrc] = useState<string | null>(null);
//   const [duration, setDuration] = useState(0);
//   const [trimStart, setTrimStart] = useState(0);
//   const [trimEnd, setTrimEnd] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [outputUrls, setOutputUrls] = useState<string[]>([]);
//   const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

//   const ffmpegRef = useRef(new FFmpeg());
//   const videoRef = useRef<HTMLVideoElement>(null);

//   const loadFfmpeg = useCallback(async () => {
//     const ffmpeg = ffmpegRef.current;
//     ffmpeg.on("log", ({ message }) => {
//       console.log(message);
//       // if (messageRef.current) messageRef.current.innerHTML = message;
//     });
//     const result = await ffmpeg.load({
//       coreURL: await toBlobURL(`${FFMPEG_URL}/ffmpeg-core.js`, "text/javascript"),
//       wasmURL: await toBlobURL(
//         `${FFMPEG_URL}/ffmpeg-core.wasm`,
//         "application/wasm"
//       ),
//       workerURL: await toBlobURL(
//         `${FFMPEG_URL}/ffmpeg-core.worker.js`,
//         "text/javascript"
//       ),
//     });
//     console.log(result);
//     setFfmpegLoaded(true);
//   }, []);

//   useEffect(() => {
//     if (videoSrc && videoRef.current) {
//       videoRef.current.currentTime = trimStart;
//     }
//   }, [trimStart, videoSrc]);

//   const handleFileSelect = (file: File) => {
//     setVideoFile(file);
//     const url = URL.createObjectURL(file);
//     setVideoSrc(url);
//     // Cleanup old URL when a new file is uploaded
//     if (videoSrc) {
//       URL.revokeObjectURL(videoSrc);
//     }
//     setTrimStart(0);
//     setOutputUrls([]);
//   };

//   const handleVideoMetadataLoaded = () => {
//     if (videoRef.current) {
//       const videoDuration = videoRef.current.duration;
//       setDuration(videoDuration);
//       setTrimEnd(videoDuration);
//     }
//   };

//   const processVideo = async (
//     start: number,
//     end: number,
//     outputName: string
//   ) => {
//     // const ffmpeg = ffmpegRef.current;
//     if (!videoFile) return;

//     await ffmpegRef.current.writeFile("input.mp4", await fetchFile(videoFile));

//     const duration = end - start;

//     await ffmpegRef.current.exec([
//       "-i",
//       "input.mp4",
//       "-ss",
//       start.toString(),
//       "-t",
//       duration.toString(),
//       "-c:v",
//       "copy",
//       "-c:a",
//       "copy",
//       outputName,
//     ]);

//     const data = await ffmpegRef.current.readFile(outputName);
//     const blobUrl = URL.createObjectURL(
//       new Blob([(data as Uint8Array).slice().buffer], { type: "video/mp4" })
//     );
//     return blobUrl;
//   };

//   const handleProcess = async () => {
//     if (!videoFile) return;

//     setIsProcessing(true);
//     setProgress(0);
//     setOutputUrls([]);

//     // const ffmpeg = ffmpegRef.current;
//     ffmpegRef.current.on("progress", ({ progress: p }) => {
//       setProgress(p * 100);
//     });

//     try {
//       const url = await processVideo(trimStart, trimEnd, "output.mp4");
//       if (url) {
//         setOutputUrls([url]);
//       }
//     } catch (error) {
//       console.error("Processing failed:", error);
//       // Handle error gracefully
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleWhatsAppSplit = async () => {
//     console.log(videoFile);

//     if (!videoFile) return;

//     setIsProcessing(true);
//     setProgress(0);
//     setOutputUrls([]);

//     // const ffmpeg = ffmpegRef.current;
//     ffmpegRef.current.on("progress", ({ progress: p }) => {
//       setProgress(p * 100);
//     });

//     const segmentDuration = 60; // 60 seconds for WhatsApp Status
//     let currentStart = trimStart;
//     const urls = [];

//     while (currentStart < trimEnd) {
//       const segmentEnd = Math.min(currentStart + segmentDuration, trimEnd);
//       const outputName = `whatsapp_clip_${urls.length + 1}.mp4`;
//       const url = await processVideo(currentStart, segmentEnd, outputName);
//       if (url) {
//         urls.push(url);
//       }
//       currentStart += segmentDuration;
//     }

//     setOutputUrls(urls);
//     setIsProcessing(false);
//   };

//   return (
//     <Container maxW="container.lg" py={10}>
//       <VStack gap={8}>
//         <Heading>Video Trimmer & Cutter</Heading>
//         {!videoFile ? (
//           <VideoUploader onFileSelect={handleFileSelect} />
//         ) : (
//           <Box w="100%">
//             <video
//               ref={videoRef}
//               src={videoSrc || ""}
//               controls
//               onLoadedMetadata={handleVideoMetadataLoaded}
//               width="100%"
//             />
//             {/* {duration > 0 && (
//               <Timeline
//                 duration={duration}
//                 trimStart={trimStart}
//                 trimEnd={trimEnd}
//                 onTrimChange={(start, end) => {
//                   setTrimStart(start);
//                   setTrimEnd(end);
//                 }}
//               />
//             )} */}
//             <Box mt={4}>
//               <Text>
//                 Selected Segment: {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}
//                 s
//               </Text>
//               <Text>Total Duration: {duration.toFixed(1)}s</Text>
//             </Box>
//           </Box>
//         )}
//         <Box w="100%">
//           <Button
//             onClick={handleProcess}
//             loading={isProcessing}
//             loadingText="Processing..."
//             colorScheme="blue"
//             mr={4}
//             disabled={!videoFile || !ffmpegLoaded}
//           >
//             Trim Video
//           </Button>
//           <Button
//             onClick={handleWhatsAppSplit}
//             loading={isProcessing}
//             loadingText="Splitting..."
//             colorScheme="green"
//             disabled={!videoFile || !ffmpegLoaded}
//           >
//             Split for WhatsApp
//           </Button>
//         </Box>
//         {isProcessing && (
//           <VStack w="100%">
//             <Progress
//               value={progress}
//               size="lg"
//               colorScheme="purple"
//               w="100%"
//             />
//             <Text>{progress.toFixed(0)}%</Text>
//           </VStack>
//         )}
//         {outputUrls.length > 0 && (
//           <VStack w="100%" mt={8}>
//             <Heading size="md">Download Clips</Heading>
//             {outputUrls.map((url, index) => (
//               <Box
//                 key={index}
//                 p={4}
//                 borderWidth="1px"
//                 borderRadius="md"
//                 w="100%"
//               >
//                 <Text fontWeight="bold">Clip {index + 1}</Text>
//                 <Link href={url} download={`trimmed_clip_${index + 1}.mp4`}>
//                   <Button colorScheme="teal" mt={2}>
//                     <Download /> Download
//                   </Button>
//                 </Link>
//               </Box>
//             ))}
//           </VStack>
//         )}
//       </VStack>
//     </Container>
//   );
// };

// export default App;


import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
