import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Card, Flex, Text, Button, VStack } from "@chakra-ui/react";
import { Clock, Scissors } from "lucide-react";

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
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
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
  onWhatsAppTrim,
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
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

  const handleMouseDown = (
    type: "start" | "end" | "seek",
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Mouse down on:", type);
    setIsDragging(type);

    if (type === "seek") {
      const time = getTimeFromPosition(event.clientX);
      onSeek(time);
    }
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      console.log("Mouse move with dragging:", isDragging);
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
    console.log("Mouse up, was dragging:", isDragging);
    setIsDragging(null);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp, isDragging]);

  if (duration === 0) return null;

  const currentTimePercent = (currentTime / duration) * 100;
  const trimStartPercent = (trimStart / duration) * 100;
  const trimEndPercent = (trimEnd / duration) * 100;
  const trimDuration = trimEnd - trimStart;

  return (
    <Card.Root
      p="6"
      gap="4"
      bgGradient="linear(to-t, #0a0a0a, #333333)" // Placeholder gradient
      boxShadow="2xl" // Replaces shadow-card
    >
      {/* Timeline Header */}
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap="2">
          <Clock size={20} color="var(--chakra-colors-chakra-primary)" />
          <Text fontWeight="medium">Timeline</Text>
        </Flex>

        <Flex alignItems="center" gap="4" fontSize="sm" color="gray.500">
          <Text>Duration: {formatTime(duration)}</Text>
          <Text>Selected: {formatTime(trimDuration)}</Text>
        </Flex>
      </Flex>

      {/* Timeline Container */}
      <VStack gap="3" align="stretch">
        <Box
          ref={timelineRef}
          position="relative"
          h="12"
          bg="gray.700" // Replaces bg-video-timeline-bg, assuming a dark gray color
          borderRadius="lg"
          cursor="pointer"
          userSelect="none"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleMouseDown("seek", e);
            }
          }}
        >
          {/* Background track */}
          <Box
            position="absolute"
            inset="0"
            bgGradient="linear(to-r, #333333, #666666)" // Replaces bg-gradient-timeline
            borderRadius="lg"
            opacity="0.3"
          />

          {/* Selected region */}
          <Box
            position="absolute"
            top="0"
            bottom="0"
            bg="blue.500" // Replaces bg-primary/30, assuming a blue primary color
            borderTop="2px solid"
            borderBottom="2px solid"
            borderColor="blue.500" // Replaces border-primary
            borderRadius="sm"
            style={{
              left: `${trimStartPercent}%`,
              width: `${trimEndPercent - trimStartPercent}%`,
            }}
          />

          {/* Current time indicator */}
          <Box
            position="absolute"
            top="0"
            bottom="0"
            w="0.5"
            bg="cyan.300" // Replaces bg-accent, assuming a light cyan
            boxShadow="0 0 10px rgba(0,255,255,0.8)" // Replaces shadow-glow
            zIndex="20"
            style={{ left: `${currentTimePercent}%` }}
          />

          {/* Trim start handle */}
          <Box
            position="absolute"
            top="1"
            bottom="1"
            w="3"
            bg="gray.400" // Replaces bg-video-trim-handle
            borderRadius="md"
            cursor="ew-resize"
            zIndex="10"
            userSelect="none"
            _hover={{ bg: "cyan.300" }} // Replaces hover:bg-accent
            transition="background-color 0.2s"
            boxShadow="lg"
            style={{
              left: `calc(${trimStartPercent}% - 6px)`,
              ...(isDragging === "start" && { bg: "cyan.300" }),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown("start", e);
            }}
          />

          {/* Trim end handle */}
          <Box
            position="absolute"
            top="1"
            bottom="1"
            w="3"
            bg="gray.400" // Replaces bg-video-trim-handle
            borderRadius="md"
            cursor="ew-resize"
            zIndex="10"
            userSelect="none"
            _hover={{ bg: "cyan.300" }} // Replaces hover:bg-accent
            transition="background-color 0.2s"
            boxShadow="lg"
            style={{
              left: `calc(${trimEndPercent}% - 6px)`,
              ...(isDragging === "end" && { bg: "cyan.300" }),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown("end", e);
            }}
          />
        </Box>

        {/* Time labels */}
        <Flex justifyContent="space-between" fontSize="xs" color="gray.500">
          <Text>{formatTime(trimStart)}</Text>
          <Text>{formatTime(currentTime)}</Text>
          <Text>{formatTime(trimEnd)}</Text>
        </Flex>
      </VStack>

      {/* WhatsApp Auto-Trim */}
      <Flex justifyContent="center" pt="2">
        <Button
          onClick={onWhatsAppTrim}
          variant="solid"
          size="lg"
          bg="green.600"
          _hover={{ bg: "green.700" }}
          color="white"
          border="0"
        >
          <Scissors size={16} /> Split Selected Range for WhatsApp (60s clips)
        </Button>
      </Flex>
    </Card.Root>
    // <Card className="p-6 space-y-4 bg-gradient-video shadow-card">
    //   {/* Timeline Header */}
    //   <div className="flex items-center justify-between">
    //     <div className="flex items-center space-x-2">
    //       <Clock className="h-5 w-5 text-primary" />
    //       <span className="font-medium">Timeline</span>
    //     </div>

    //     <div className="flex items-center space-x-4 text-sm text-muted-foreground">
    //       <span>Duration: {formatTime(duration)}</span>
    //       <span>Selected: {formatTime(trimDuration)}</span>
    //     </div>
    //   </div>

    //   {/* Timeline Container */}
    //   <div className="space-y-3">
    //     <div
    //       ref={timelineRef}
    //       className="relative h-12 bg-video-timeline-bg rounded-lg cursor-pointer select-none"
    //       onMouseDown={(e) => {
    //         if (e.target === e.currentTarget) {
    //           handleMouseDown("seek", e);
    //         }
    //       }}
    //     >
    //       {/* Background track */}
    //       <div className="absolute inset-0 bg-gradient-timeline rounded-lg opacity-30" />

    //       {/* Selected region */}
    //       <div
    //         className="absolute top-0 bottom-0 bg-primary/30 border-t-2 border-b-2 border-primary rounded-sm"
    //         style={{
    //           left: `${trimStartPercent}%`,
    //           width: `${trimEndPercent - trimStartPercent}%`,
    //         }}
    //       />

    //       {/* Current time indicator */}
    //       <div
    //         className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-glow z-20"
    //         style={{ left: `${currentTimePercent}%` }}
    //       />

    //       {/* Trim start handle */}
    //       <div
    //         className={cn(
    //           "absolute top-1 bottom-1 w-3 bg-video-trim-handle rounded cursor-ew-resize z-10 select-none",
    //           "hover:bg-accent transition-colors duration-200 shadow-lg",
    //           isDragging === "start" && "bg-accent"
    //         )}
    //         style={{ left: `calc(${trimStartPercent}% - 6px)` }}
    //         onMouseDown={(e) => {
    //           e.stopPropagation();
    //           handleMouseDown("start", e);
    //         }}
    //       />

    //       {/* Trim end handle */}
    //       <div
    //         className={cn(
    //           "absolute top-1 bottom-1 w-3 bg-video-trim-handle rounded cursor-ew-resize z-10 select-none",
    //           "hover:bg-accent transition-colors duration-200 shadow-lg",
    //           isDragging === "end" && "bg-accent"
    //         )}
    //         style={{ left: `calc(${trimEndPercent}% - 6px)` }}
    //         onMouseDown={(e) => {
    //           e.stopPropagation();
    //           handleMouseDown("end", e);
    //         }}
    //       />
    //     </div>

    //     {/* Time labels */}
    //     <div className="flex justify-between text-xs text-muted-foreground">
    //       <span>{formatTime(trimStart)}</span>
    //       <span>{formatTime(currentTime)}</span>
    //       <span>{formatTime(trimEnd)}</span>
    //     </div>
    //   </div>

    //   {/* WhatsApp Auto-Trim */}
    //   <div className="flex justify-center pt-2">
    //     <Button
    //       onClick={onWhatsAppTrim}
    //       variant="solid"
    //       size="lg"
    //       className="bg-green-600 hover:bg-green-700 text-white border-0"
    //     >
    //       <Scissors className="h-4 w-4 mr-2" />
    //       Split Selected Range for WhatsApp (60s clips)
    //     </Button>
    //   </div>
    // </Card>
  );
};

export default VideoTimeline;
