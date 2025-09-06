import { useCallback, useState } from "react";
import { Box, VStack, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { Upload } from "lucide-react";

import { useFFmpeg } from "@/hooks/useFFmpeg";
import { toaster } from "@/lib/util";

import { DownloadManager, type VideoSegment } from "./DownloadManager";
import ProcessingProgress from "./ProcessingProgress";
import VideoUploader from "./VideoUploader";
import VideoPlayer from "./VideoPlayer";
import VideoTimeline from "./VideoTimeline";

export const VideoTrimmer = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [processedSegments, setProcessedSegments] = useState<VideoSegment[]>(
    []
  );

  const { isLoading, progress, splitVideoForWhatsApp } = useFFmpeg();

  const handleVideoUpload = useCallback((file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setProcessedSegments([]);

    toaster.create({
      title: "Video uploaded successfully",
      description: `${file.name} is ready for editing.`,
    });
  }, []);

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setTrimEnd(newDuration);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleTrimStartChange = useCallback(
    (time: number) => {
      setTrimStart(time);
      if (currentTime < time) {
        setCurrentTime(time);
      }
    },
    [currentTime]
  );

  const handleTrimEndChange = useCallback(
    (time: number) => {
      setTrimEnd(time);
      if (currentTime > time) {
        setCurrentTime(time);
      }
    },
    [currentTime]
  );

  const handleWhatsAppTrim = useCallback(async () => {
    if (!videoFile) return;

    try {
      const segments = await splitVideoForWhatsApp(
        videoFile,
        60,
        trimStart,
        trimEnd
      );

      if (segments.length > 0) {
        const videoSegments: VideoSegment[] = segments.map((data, index) => ({
          id: `segment-${index + 1}`,
          name: `${videoFile.name.split(".")[0]}_part_${index + 1}.mp4`,
          data,
          duration: 60, // Each segment is 60 seconds (except possibly the last)
          downloaded: false,
        }));

        setProcessedSegments(videoSegments);

        const selectedDuration = trimEnd - trimStart;
        toaster.create({
          title: "Video split successfully",
          description: `Created ${
            segments.length
          } WhatsApp-ready segments from ${Math.round(
            selectedDuration
          )}s selection.`,
        });
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Processing failed",
        description:
          "There was an error splitting your video. Please try again.",
        type: "error",
      });
    }
  }, [videoFile, splitVideoForWhatsApp, trimStart, trimEnd]);

  const handleDownload = useCallback((segment: VideoSegment) => {
    const dataLength = segment.data.byteLength;
    const newArrayBuffer = new ArrayBuffer(dataLength);
    const newUint8Array = new Uint8Array(newArrayBuffer);
    newUint8Array.set(segment.data);
    const blob = new Blob([newUint8Array], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = segment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mark as downloaded
    setProcessedSegments((prev) =>
      prev.map((s) => (s.id === segment.id ? { ...s, downloaded: true } : s))
    );

    toaster.create({
      title: "Download started",
      description: `${segment.name} is downloading.`,
    });
  }, []);

  const handleDownloadAll = useCallback(() => {
    processedSegments.forEach((segment) => {
      if (!segment.downloaded) {
        setTimeout(() => handleDownload(segment), 100);
      }
    });
  }, [processedSegments, handleDownload]);

  const handleClearSegments = useCallback(() => {
    setProcessedSegments([]);
    toaster.create({
      title: "Downloads cleared",
      description: "All processed videos have been removed.",
    });
  }, []);

  const resetApp = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl("");
    setDuration(0);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setProcessedSegments([]);
  }, [videoUrl]);

  return (
    <VStack
      minH="100vh"
      bg="gray.900"
      p="4"
      gap="6"
      width="100vw"
      alignItems="center"
      justifyContent="center"
    >
      <Box maxW="4xl" mx="auto" gap="6">
        {/* Header */}
        <VStack textAlign="center" gap="4">
          <Heading
            as="h1"
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, teal.500, blue.500)" // Replaces bg-gradient-primary
            bgClip="text"
            color="transparent"
          >
            Video Trimmer & WhatsApp Splitter
          </Heading>
          <Text fontSize="lg" color="gray.500" maxW="2xl" mx="auto">
            Upload your video, trim it to perfection, and split it into
            WhatsApp-ready 60-second segments. Professional video editing made
            simple.
          </Text>
        </VStack>

        {/* Upload Section */}
        {!videoFile && (
          <VideoUploader
            onVideoUpload={handleVideoUpload}
            isProcessing={isLoading}
          />
        )}

        {/* Video Player */}
        {videoFile && videoUrl && (
          <VideoPlayer
            videoUrl={videoUrl}
            currentTime={currentTime}
            duration={duration}
            onTimeUpdate={handleSeek}
            onDurationChange={handleDurationChange}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
        )}

        {/* Timeline */}
        {videoFile && duration > 0 && (
          <VideoTimeline
            duration={duration}
            currentTime={currentTime}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onTrimStartChange={handleTrimStartChange}
            onTrimEndChange={handleTrimEndChange}
            onSeek={handleSeek}
            onWhatsAppTrim={handleWhatsAppTrim}
          />
        )}

        {/* Processing Progress */}
        <ProcessingProgress progress={progress} isVisible={isLoading} />

        {/* Download Manager */}
        <DownloadManager
          segments={processedSegments}
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
          onClear={handleClearSegments}
        />

        {/* Reset Button */}
        {videoFile && (
          <Flex justifyContent="center">
            <Button
              onClick={resetApp}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              <Upload /> Upload New Video
            </Button>
          </Flex>
        )}
      </Box>
    </VStack>
    // <div className="min-h-screen bg-background p-4 space-y-6">
    //   <div className="max-w-4xl mx-auto space-y-6">
    //     {/* Header */}
    //     <div className="text-center space-y-4">
    //       <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
    //         Video Trimmer & WhatsApp Splitter
    //       </h1>
    //       <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
    //         Upload your video, trim it to perfection, and split it into
    //         WhatsApp-ready 60-second segments. Professional video editing made
    //         simple.
    //       </p>
    //     </div>

    //     {/* Upload Section */}
    //     {!videoFile && (
    //       <VideoUploader
    //         onVideoUpload={handleVideoUpload}
    //         isProcessing={isLoading}
    //       />
    //     )}

    //     {/* Video Player */}
    //     {videoFile && videoUrl && (
    //       <VideoPlayer
    //         videoUrl={videoUrl}
    //         currentTime={currentTime}
    //         duration={duration}
    //         onTimeUpdate={handleSeek}
    //         onDurationChange={handleDurationChange}
    //         trimStart={trimStart}
    //         trimEnd={trimEnd}
    //       />
    //     )}

    //     {/* Timeline */}
    //     {videoFile && duration > 0 && (
    //       <VideoTimeline
    //         duration={duration}
    //         currentTime={currentTime}
    //         trimStart={trimStart}
    //         trimEnd={trimEnd}
    //         onTrimStartChange={handleTrimStartChange}
    //         onTrimEndChange={handleTrimEndChange}
    //         onSeek={handleSeek}
    //         onWhatsAppTrim={handleWhatsAppTrim}
    //       />
    //     )}

    //     {/* Processing Progress */}
    //     <ProcessingProgress progress={progress} isVisible={isLoading} />

    //     {/* Download Manager */}
    //     <DownloadManager
    //       segments={processedSegments}
    //       onDownload={handleDownload}
    //       onDownloadAll={handleDownloadAll}
    //       onClear={handleClearSegments}
    //     />

    //     {/* Reset Button */}
    //     {videoFile && (
    //       <div className="flex justify-center">
    //         <Button
    //           onClick={resetApp}
    //           disabled={isLoading}
    //           variant="outline"
    //           size="lg"
    //         >
    //           <Upload />
    //           Upload New Video
    //         </Button>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
};
export default VideoTrimmer;
