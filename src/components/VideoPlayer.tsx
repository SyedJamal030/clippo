import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  AspectRatio,
  IconButton,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Play, Pause, VolumeX, Volume2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  duration: number;
  setThumbnails: (thumbnails: string[]) => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  isProcessing: boolean;
  trimStart: number;
  trimEnd: number;
}

export const VideoPlayer = ({
  videoUrl,
  onTimeUpdate,
  onDurationChange,
  setThumbnails,
  isProcessing,
  duration,
  trimStart,
  trimEnd,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (duration > 0 && videoRef.current) {
      generateThumbnails(videoRef.current)
        .then((urls) => {
          setThumbnails(urls);
          onDurationChange(videoRef.current!.duration);
        })
        .finally(() => setProcessing(false));
    }
  }, [duration, onDurationChange, setThumbnails, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      onTimeUpdate(time);

      // Auto-pause at trim end
      if (time >= trimEnd && trimEnd > 0) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      onDurationChange(video.duration);
      setIsLoaded(true);
    };

    const handleLoadedData = () => {
      setIsLoaded(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [onTimeUpdate, onDurationChange, trimEnd]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || processing) return;

    // Seek to trim start when trimStart changes
    if (Math.abs(video.currentTime - trimStart) > 0.1) {
      video.currentTime = trimStart;
    }
  }, [trimStart, isLoaded, processing]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // If at trim end, start from trim start
      if (video.currentTime >= trimEnd && trimEnd > 0) {
        video.currentTime = trimStart;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <Card
      overflow="hidden"
      boxShadow="2xl"
      borderBottomRadius="0"
      bgGradient="linear(to-t, #0a0a0a, #333333)"
    >
      <Box position="relative" role="group">
        <AspectRatio maxH="96" ratio={16 / 9}>
          <video
            ref={videoRef}
            src={videoUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{ objectFit: "contain", background: "black" }}
            playsInline
          />
        </AspectRatio>

        {/* Video Controls Overlay */}
        <Box
          position="absolute"
          inset="0"
          bg="blackAlpha.600"
          opacity="0"
          _groupHover={{ opacity: "1" }}
          transition="opacity 0.3s"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="4"
        >
          <IconButton
            size="lg"
            variant="ghost"
            onClick={togglePlayPause}
            bg="blackAlpha.500"
            _hover={{ bg: "blackAlpha.700" }}
            color="white"
            border="0"
            boxShadow="lg"
            disabled={isProcessing}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} style={{ marginLeft: 1 }} />
            )}
          </IconButton>
          <IconButton
            size="lg"
            variant="ghost"
            onClick={toggleMute}
            bg="blackAlpha.500"
            _hover={{ bg: "blackAlpha.700" }}
            color="white"
            border="0"
            boxShadow="lg"
            disabled={isProcessing}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </IconButton>
        </Box>

        {/* Loading indicator */}
        {(!isLoaded || processing) && (
          <Box
            position="absolute"
            inset="0"
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Center h="full">
              <Spinner color="blue.500" />
            </Center>
          </Box>
        )}
      </Box>
    </Card>
    // <Card className="overflow-hidden shadow-video bg-gradient-video">
    //   <div className="relative group">
    //     <video
    //       ref={videoRef}
    //       src={videoUrl}
    //       className="w-full h-auto max-h-96 object-contain bg-black"
    //       onPlay={() => setIsPlaying(true)}
    //       onPause={() => setIsPlaying(false)}
    //     />

    //     {/* Video Controls Overlay */}
    //     <div
    //       className={cn(
    //         "absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100",
    //         "transition-opacity duration-300 flex items-center justify-center space-x-4"
    //       )}
    //     >
    //       <Button
    //         size="lg"
    //         variant="ghost"
    //         onClick={togglePlayPause}
    //         className="bg-black/50 hover:bg-black/70 text-white border-0 shadow-lg"
    //       >
    //         {isPlaying ? (
    //           <Pause className="h-6 w-6" />
    //         ) : (
    //           <Play className="h-6 w-6 ml-1" />
    //         )}
    //       </Button>

    //       <Button
    //         size="lg"
    //         variant="ghost"
    //         onClick={toggleMute}
    //         className="bg-black/50 hover:bg-black/70 text-white border-0 shadow-lg"
    //       >
    //         {isMuted ? (
    //           <VolumeX className="h-5 w-5" />
    //         ) : (
    //           <Volume2 className="h-5 w-5" />
    //         )}
    //       </Button>
    //     </div>

    //     {/* Loading indicator */}
    //     {!isLoaded && (
    //       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
    //         <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    //       </div>
    //     )}
    //   </div>
    // </Card>
  );
};
export default VideoPlayer;
// A helper function to generate thumbnails from a video element
const generateThumbnails = async (
  videoElement: HTMLVideoElement,
  count = 20
) => {
  const thumbnails: string[] = [];
  if (!videoElement || videoElement.duration === 0) {
    return [];
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return [];

  // Set canvas dimensions to match a smaller, consistent thumbnail size
  const thumbnailWidth = 100;
  const thumbnailHeight = 60;
  canvas.width = thumbnailWidth;
  canvas.height = thumbnailHeight;

  // Calculate the time interval for each thumbnail
  const interval = videoElement.duration / count;

  for (let i = 0; i < count; i++) {
    const time = i * interval;

    await new Promise((resolve) => {
      // Set the video's current time to the desired frame
      videoElement.currentTime = time;

      // Wait for the video frame to be ready
      const onSeeked = () => {
        // Draw the frame onto the canvas
        context.drawImage(videoElement, 0, 0, thumbnailWidth, thumbnailHeight);

        // Get the image data URL and add it to the array
        thumbnails.push(canvas.toDataURL("image/jpeg"));

        // Clean up the event listener
        videoElement.removeEventListener("seeked", onSeeked);
        resolve(thumbnails);
      };

      videoElement.addEventListener("seeked", onSeeked);
    });
  }

  return thumbnails;
};
