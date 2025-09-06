// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { Box, Card, Flex, Text, Button, VStack } from "@chakra-ui/react";
// import { Clock, Scissors } from "lucide-react";

// interface VideoTimelineProps {
//   duration: number;
//   currentTime: number;
//   trimStart: number;
//   trimEnd: number;
//   onTrimStartChange: (time: number) => void;
//   onTrimEndChange: (time: number) => void;
//   onSeek: (time: number) => void;
//   onWhatsAppTrim: () => void;
// }

// export const VideoTimeline = ({
//   duration,
//   currentTime,
//   trimStart,
//   trimEnd,
//   onTrimStartChange,
//   onTrimEndChange,
//   onSeek,
//   onWhatsAppTrim,
// }: VideoTimelineProps) => {
//   const timelineRef = useRef<HTMLDivElement>(null);
//   const [isDragging, setIsDragging] = useState<"start" | "end" | "seek" | null>(
//     null
//   );

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   const getTimeFromPosition = useCallback(
//     (clientX: number) => {
//       if (!timelineRef.current) return 0;

//       const rect = timelineRef.current.getBoundingClientRect();
//       const position = (clientX - rect.left) / rect.width;
//       return Math.max(0, Math.min(duration, position * duration));
//     },
//     [duration]
//   );

//   const handleMouseDown = (
//     type: "start" | "end" | "seek",
//     event: React.MouseEvent
//   ) => {
//     event.preventDefault();
//     event.stopPropagation();
//     console.log("Mouse down on:", type);
//     setIsDragging(type);

//     if (type === "seek") {
//       const time = getTimeFromPosition(event.clientX);
//       onSeek(time);
//     }
//   };

//   const handleMouseMove = useCallback(
//     (event: MouseEvent) => {
//       if (!isDragging) return;

//       console.log("Mouse move with dragging:", isDragging);
//       const time = getTimeFromPosition(event.clientX);

//       switch (isDragging) {
//         case "start":
//           onTrimStartChange(Math.min(time, trimEnd - 1));
//           break;
//         case "end":
//           onTrimEndChange(Math.max(time, trimStart + 1));
//           break;
//         case "seek":
//           onSeek(time);
//           break;
//       }
//     },
//     [
//       getTimeFromPosition,
//       isDragging,
//       onSeek,
//       onTrimEndChange,
//       onTrimStartChange,
//       trimEnd,
//       trimStart,
//     ]
//   );

//   const handleMouseUp = useCallback(() => {
//     console.log("Mouse up, was dragging:", isDragging);
//     setIsDragging(null);
//   }, [isDragging]);

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener("mousemove", handleMouseMove);
//       document.addEventListener("mouseup", handleMouseUp);

//       return () => {
//         document.removeEventListener("mousemove", handleMouseMove);
//         document.removeEventListener("mouseup", handleMouseUp);
//       };
//     }
//   }, [handleMouseMove, handleMouseUp, isDragging]);

//   if (duration === 0) return null;

//   const currentTimePercent = (currentTime / duration) * 100;
//   const trimStartPercent = (trimStart / duration) * 100;
//   const trimEndPercent = (trimEnd / duration) * 100;
//   const trimDuration = trimEnd - trimStart;

//   return (
//     <Card
//       p="6"
//       gap="4"
//       bgGradient="linear(to-t, #0a0a0a, #333333)" // Placeholder gradient
//       boxShadow="2xl" // Replaces shadow-card
//     >
//       {/* Timeline Header */}
//       <Flex alignItems="center" justifyContent="space-between">
//         <Flex alignItems="center" gap="2" color="gray.200">
//           <Clock size={20} />
//           <Text fontWeight="medium">Timeline</Text>
//         </Flex>

//         <Flex alignItems="center" gap="4" fontSize="sm" color="gray.500">
//           <Text>Duration: {formatTime(duration)}</Text>
//           <Text>Selected: {formatTime(trimDuration)}</Text>
//         </Flex>
//       </Flex>

//       {/* Timeline Container */}
//       <VStack gap="3" align="stretch">
//         <Box
//           ref={timelineRef}
//           position="relative"
//           h="12"
//           bg="gray.700" // Replaces bg-video-timeline-bg, assuming a dark gray color
//           borderRadius="lg"
//           cursor="pointer"
//           userSelect="none"
//           onMouseDown={(e) => {
//             if (e.target === e.currentTarget) {
//               handleMouseDown("seek", e);
//             }
//           }}
//         >
//           {/* Background track */}
//           <Box
//             position="absolute"
//             inset="0"
//             bgGradient="linear(to-r, #333333, #666666)" // Replaces bg-gradient-timeline
//             borderRadius="lg"
//             opacity="0.3"
//           />

//           {/* Selected region */}
//           <Box
//             position="absolute"
//             top="0"
//             bottom="0"
//             bg="blue.500" // Replaces bg-primary/30, assuming a blue primary color
//             borderTop="2px solid"
//             borderBottom="2px solid"
//             borderColor="blue.500" // Replaces border-primary
//             borderRadius="sm"
//             style={{
//               left: `${trimStartPercent}%`,
//               width: `${trimEndPercent - trimStartPercent}%`,
//             }}
//           />

//           {/* Current time indicator */}
//           <Box
//             position="absolute"
//             top="0"
//             bottom="0"
//             w="0.5"
//             bg="cyan.300" // Replaces bg-accent, assuming a light cyan
//             boxShadow="0 0 10px rgba(0,255,255,0.8)" // Replaces shadow-glow
//             zIndex="20"
//             style={{ left: `${currentTimePercent}%` }}
//           />

//           {/* Trim start handle */}
//           <Box
//             position="absolute"
//             top="1"
//             bottom="1"
//             w="3"
//             bg="gray.400" // Replaces bg-video-trim-handle
//             borderRadius="md"
//             cursor="ew-resize"
//             zIndex="10"
//             userSelect="none"
//             _hover={{ bg: "cyan.300" }} // Replaces hover:bg-accent
//             transition="background-color 0.2s"
//             boxShadow="lg"
//             style={{
//               left: `calc(${trimStartPercent}% - 6px)`,
//               ...(isDragging === "start" && { bg: "cyan.300" }),
//             }}
//             onMouseDown={(e) => {
//               e.stopPropagation();
//               handleMouseDown("start", e);
//             }}
//           />

//           {/* Trim end handle */}
//           <Box
//             position="absolute"
//             top="1"
//             bottom="1"
//             w="3"
//             bg="gray.400" // Replaces bg-video-trim-handle
//             borderRadius="md"
//             cursor="ew-resize"
//             zIndex="10"
//             userSelect="none"
//             _hover={{ bg: "cyan.300" }} // Replaces hover:bg-accent
//             transition="background-color 0.2s"
//             boxShadow="lg"
//             style={{
//               left: `calc(${trimEndPercent}% - 6px)`,
//               ...(isDragging === "end" && { bg: "cyan.300" }),
//             }}
//             onMouseDown={(e) => {
//               e.stopPropagation();
//               handleMouseDown("end", e);
//             }}
//           />
//         </Box>

//         {/* Time labels */}
//         <Flex justifyContent="space-between" fontSize="xs" color="gray.500">
//           <Text>{formatTime(trimStart)}</Text>
//           <Text>{formatTime(currentTime)}</Text>
//           <Text>{formatTime(trimEnd)}</Text>
//         </Flex>
//       </VStack>

//       {/* WhatsApp Auto-Trim */}
//       <Flex justifyContent="center" pt="2">
//         <Button
//           onClick={onWhatsAppTrim}
//           variant="solid"
//           size="lg"
//           bg="green.600"
//           _hover={{ bg: "green.700" }}
//           color="white"
//           border="0"
//         >
//           <Scissors size={16} /> Split Selected Range
//         </Button>
//       </Flex>
//     </Card>
//     // <Card className="p-6 space-y-4 bg-gradient-video shadow-card">
//     //   {/* Timeline Header */}
//     //   <div className="flex items-center justify-between">
//     //     <div className="flex items-center space-x-2">
//     //       <Clock className="h-5 w-5 text-primary" />
//     //       <span className="font-medium">Timeline</span>
//     //     </div>

//     //     <div className="flex items-center space-x-4 text-sm text-muted-foreground">
//     //       <span>Duration: {formatTime(duration)}</span>
//     //       <span>Selected: {formatTime(trimDuration)}</span>
//     //     </div>
//     //   </div>

//     //   {/* Timeline Container */}
//     //   <div className="space-y-3">
//     //     <div
//     //       ref={timelineRef}
//     //       className="relative h-12 bg-video-timeline-bg rounded-lg cursor-pointer select-none"
//     //       onMouseDown={(e) => {
//     //         if (e.target === e.currentTarget) {
//     //           handleMouseDown("seek", e);
//     //         }
//     //       }}
//     //     >
//     //       {/* Background track */}
//     //       <div className="absolute inset-0 bg-gradient-timeline rounded-lg opacity-30" />

//     //       {/* Selected region */}
//     //       <div
//     //         className="absolute top-0 bottom-0 bg-primary/30 border-t-2 border-b-2 border-primary rounded-sm"
//     //         style={{
//     //           left: `${trimStartPercent}%`,
//     //           width: `${trimEndPercent - trimStartPercent}%`,
//     //         }}
//     //       />

//     //       {/* Current time indicator */}
//     //       <div
//     //         className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-glow z-20"
//     //         style={{ left: `${currentTimePercent}%` }}
//     //       />

//     //       {/* Trim start handle */}
//     //       <div
//     //         className={cn(
//     //           "absolute top-1 bottom-1 w-3 bg-video-trim-handle rounded cursor-ew-resize z-10 select-none",
//     //           "hover:bg-accent transition-colors duration-200 shadow-lg",
//     //           isDragging === "start" && "bg-accent"
//     //         )}
//     //         style={{ left: `calc(${trimStartPercent}% - 6px)` }}
//     //         onMouseDown={(e) => {
//     //           e.stopPropagation();
//     //           handleMouseDown("start", e);
//     //         }}
//     //       />

//     //       {/* Trim end handle */}
//     //       <div
//     //         className={cn(
//     //           "absolute top-1 bottom-1 w-3 bg-video-trim-handle rounded cursor-ew-resize z-10 select-none",
//     //           "hover:bg-accent transition-colors duration-200 shadow-lg",
//     //           isDragging === "end" && "bg-accent"
//     //         )}
//     //         style={{ left: `calc(${trimEndPercent}% - 6px)` }}
//     //         onMouseDown={(e) => {
//     //           e.stopPropagation();
//     //           handleMouseDown("end", e);
//     //         }}
//     //       />
//     //     </div>

//     //     {/* Time labels */}
//     //     <div className="flex justify-between text-xs text-muted-foreground">
//     //       <span>{formatTime(trimStart)}</span>
//     //       <span>{formatTime(currentTime)}</span>
//     //       <span>{formatTime(trimEnd)}</span>
//     //     </div>
//     //   </div>

//     //   {/* WhatsApp Auto-Trim */}
//     //   <div className="flex justify-center pt-2">
//     //     <Button
//     //       onClick={onWhatsAppTrim}
//     //       variant="solid"
//     //       size="lg"
//     //       className="bg-green-600 hover:bg-green-700 text-white border-0"
//     //     >
//     //       <Scissors className="h-4 w-4 mr-2" />
//     //       Split Selected Range for WhatsApp (60s clips)
//     //     </Button>
//     //   </div>
//     // </Card>
//   );
// };

// export default VideoTimeline;

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import { Clock, Scissors } from "lucide-react";

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  thumbnails: string[];
  isProcessing: boolean;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
  onSeek: (time: number) => void;
  onWhatsAppTrim: () => void;
}

export const VideoTimeline = ({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  thumbnails,
  isProcessing,
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
  onWhatsAppTrim,
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState<"start" | "end" | "seek" | null>(
    null
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!timelineRef.current) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(duration, position * duration));
    },
    [duration]
  );

  // Use touch events for mobile responsiveness
  const handleTouchStart = (
    type: "start" | "end" | "seek",
    event: React.TouchEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(type);
    if (type === "seek") {
      const time = getTimeFromPosition(event.touches[0].clientX);
      onSeek(time);
    }
  };

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(event.touches[0].clientX);
      switch (isDragging) {
        case "start":
          onTrimStartChange(Math.min(time, trimEnd - 1));
          break;
        case "end":
          onTrimEndChange(Math.max(time, trimStart + 1));
          break;
        case "seek":
          onSeek(time);
          break;
      }
    },
    [
      getTimeFromPosition,
      isDragging,
      onSeek,
      onTrimEndChange,
      onTrimStartChange,
      trimEnd,
      trimStart,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Mouse event handlers for desktop
  const handleMouseDown = (
    type: "start" | "end" | "seek",
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(type);
    if (type === "seek") {
      const time = getTimeFromPosition(event.clientX);
      onSeek(time);
    }
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(event.clientX);
      switch (isDragging) {
        case "start":
          onTrimStartChange(Math.min(time, trimEnd - 1));
          break;
        case "end":
          onTrimEndChange(Math.max(time, trimStart + 1));
          break;
        case "seek":
          onSeek(time);
          break;
      }
    },
    [
      getTimeFromPosition,
      isDragging,
      onSeek,
      onTrimEndChange,
      onTrimStartChange,
      trimEnd,
      trimStart,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Effect to add and clean up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
  ]);

  // This useEffect handles the dynamic scrolling of the thumbnails
  useEffect(() => {
    if (scrollContainerRef.current && thumbnails.length > 0) {
      // Calculate the scroll position based on the current time
      const scrollPosition =
        (currentTime / duration) *
        (scrollContainerRef.current.scrollWidth -
          scrollContainerRef.current.clientWidth);
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [currentTime, duration, thumbnails]);

  // Use a different size for the trim handles on mobile
  const handleSize = useBreakpointValue({ base: "4", md: "3" });
  const handleOffset = useBreakpointValue({ base: "8px", md: "6px" });
  const selectedTimeFontSize = useBreakpointValue({ base: "sm", md: "xs" });

  if (duration === 0) return null;

  const currentTimePercent = (currentTime / duration) * 100;
  const trimStartPercent = (trimStart / duration) * 100;
  const trimEndPercent = (trimEnd / duration) * 100;
  const trimDuration = trimEnd - trimStart;

  return (
    <Card borderTopRadius="0" p="4" gap="4" bg="gray.800" boxShadow="2xl">
      {/* Timeline Header - Combined for better use of space */}
      <Flex direction="column" alignItems="center">
        <HStack mb="2" spacing="2" color="gray.200">
          <Clock size={20} />
          <Text fontWeight="medium">Timeline</Text>
        </HStack>
        <HStack spacing="4" fontSize="sm" color="gray.400">
          <Text>
            <strong>Duration:</strong> {formatTime(duration)}
          </Text>
          <Text>
            <strong>Selected:</strong> {formatTime(trimDuration)}
          </Text>
        </HStack>
      </Flex>
      {/* --- */}
      {/* Timeline Container */}
      <VStack gap="3" align="stretch">
        <Box
          ref={timelineRef}
          position="relative"
          h="12"
          bg="gray.900"
          borderRadius="lg"
          cursor="pointer"
          userSelect="none"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              handleMouseDown("seek", e);
            }
          }}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              handleTouchStart("seek", e);
            }
          }}
        >
          {/* Background track */}
          <Box
            inset="0"
            position="absolute"
            bg="gray.100"
            borderRadius="sm"
            overflow="hidden"
            w="full"
            opacity="0.9"
          >
            <Flex
              h="full"
              w="full"
              ref={scrollContainerRef}
              overflow="hidden"
              borderRadius="lg"
              align="stretch"
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {thumbnails.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Frame ${index}`}
                  flex="1"
                  objectFit="cover"
                  h="full"
                />
              ))}
            </Flex>
          </Box>

          {/* Selected region */}
          <Box
            position="absolute"
            top="0"
            bottom="0"
            border="2px solid"
            borderColor="gray.100"
            borderRadius="sm"
            style={{
              left: `${trimStartPercent}%`,
              width: `${trimEndPercent - trimStartPercent + 0.45}%`,
            }}
          />

          {/* Current time indicator */}
          <Box
            position="absolute"
            top="0"
            bottom="0"
            w="0.5"
            bg="gray.100"
            boxShadow="0 0 10px rgba(226, 232, 240,0.8)"
            style={{ left: `${currentTimePercent}%` }}
            zIndex="10"
          />

          {/* Trim start handle */}
          <Box
            position="absolute"
            top="1"
            bottom="1"
            w={handleSize}
            bg="gray.400"
            borderRadius="md"
            cursor="ew-resize"
            zIndex="20"
            userSelect="none"
            _hover={{ bg: "blue.500" }}
            transition="background-color 0.2s"
            boxShadow="lg"
            style={{
              left: `calc(${trimStartPercent}% - ${handleOffset})`,
              ...(isDragging === "start" && { bg: "blue.500" }),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                handleMouseDown("start", e);
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                handleTouchStart("start", e);
              }
            }}
          />

          {/* Trim end handle */}
          <Box
            position="absolute"
            top="1"
            bottom="1"
            w={handleSize}
            bg="gray.400"
            borderRadius="md"
            cursor="ew-resize"
            zIndex="20"
            userSelect="none"
            _hover={{ bg: "blue.500" }}
            transition="background-color 0.2s"
            boxShadow="lg"
            style={{
              left: `calc(${trimEndPercent}% - ${handleOffset})`,
              ...(isDragging === "end" && { bg: "blue.500" }),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                handleMouseDown("end", e);
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                handleTouchStart("end", e);
              }
            }}
          />
        </Box>
        {/* --- */}
        {/* Time labels - Combined and centralized for clarity */}
        <VStack spacing={1} align="stretch" fontSize={selectedTimeFontSize}>
          <HStack justifyContent="center" color="blue.500" fontWeight="bold">
            <Text>
              <strong>{formatTime(currentTime)}</strong>
            </Text>
          </HStack>
          <HStack justifyContent="space-between" color="gray.500">
            <Text>{formatTime(trimStart)}</Text>
            <Text>{formatTime(trimEnd)}</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* --- */}
      {/* Action Button - Clear, large, and centered */}
      <Flex justifyContent="center" pt="2">
        <Button
          onClick={onWhatsAppTrim}
          variant="solid"
          size="lg"
          bg="green.600"
          _hover={{ bg: "green.700" }}
          color="white"
          width="full"
          leftIcon={<Scissors size={16} />}
          disabled={isProcessing}
        >
          Split Selected Range
        </Button>
      </Flex>
    </Card>
  );
};

export default VideoTimeline;
