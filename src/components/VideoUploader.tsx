import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Upload, FileVideo, AlertCircle } from "lucide-react";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
  isProcessing: boolean;
}

export const VideoUploader = ({
  onVideoUpload,
  isProcessing,
}: VideoUploaderProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }

      onVideoUpload(file);
    },
    [onVideoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"],
    },
    multiple: false,
    disabled: isProcessing,
  });
  const bg = useColorModeValue("gray.50", "gray.800");
  const hoverBorderColor = useColorModeValue("blue.500", "blue.200");
  const activeBgColor = useColorModeValue("blue.100", "blue.800");
  const hoverBoxShadow = useColorModeValue(
    "0 0 10px var(--chakra-colors-blue-500)",
    "0 0 10px var(--chakra-colors-blue-200)"
  );
  const foregroundColor = useColorModeValue("gray.600", "gray.400");
  const mutedForegroundColor = useColorModeValue("gray.500", "gray.500");
  const destructiveColor = useColorModeValue("red.500", "red.400");

  return (
    <Box
      {...getRootProps()}
      bg={isDragActive ? activeBgColor : bg}
      cursor={isProcessing ? "not-allowed" : "pointer"}
      opacity={isProcessing ? 0.5 : 1}
      transition="ease-in-out"
      boxShadow={isDragActive ? hoverBoxShadow : undefined}
      _hover={{
        border: "2px dashed",
        borderColor: hoverBorderColor,
        boxShadow: hoverBoxShadow,
      }}
    >
      <input {...getInputProps()} />
      <VStack gap={4} align="center" justify="center" p={12} textAlign="center">
        <Box css={isDragActive ? { transform: "scale(1.1)" } : undefined}>
          <Icon
            as={isDragActive ? FileVideo : Upload}
            boxSize={8}
            color={foregroundColor}
          />
        </Box>

        <VStack gap={2}>
          <Text fontSize="xl" fontWeight="semibold" color={foregroundColor}>
            {isDragActive ? "Drop your video here" : "Upload your video"}
          </Text>
          <Text color={mutedForegroundColor}>
            Drag and drop or click to select a video file
          </Text>
          <Text fontSize="sm" color={mutedForegroundColor}>
            Supports MP4, MOV, WebM, AVI, MKV (Max 100MB)
          </Text>
        </VStack>

        {!isDragActive && !isProcessing && (
          <Button variant="outline" size="lg" mt={4}>
            Choose File
          </Button>
        )}

        {error && (
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            color={destructiveColor}
            mt={4}
          >
            <Icon as={AlertCircle} boxSize={4} mr={2} />
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}
      </VStack>
    </Box>
    // <Card
    //   className={cn(
    //     "border-2 border-dashed transition-all duration-300 ease-spring cursor-pointer",
    //     "hover:border-primary hover:shadow-glow",
    //     isDragActive && "border-primary bg-primary/5 shadow-glow",
    //     isProcessing && "cursor-not-allowed opacity-50"
    //   )}
    // >
    //   <div
    //     {...getRootProps()}
    //     className="flex flex-col items-center justify-center p-12 text-center space-y-4"
    //   >
    //     <input {...getInputProps()} />

    //     <div
    //       className={cn(
    //         "p-4 rounded-full bg-gradient-primary transition-transform duration-300",
    //         isDragActive && "scale-110"
    //       )}
    //     >
    //       {isDragActive ? (
    //         <FileVideo className="h-8 w-8 text-primary-foreground" />
    //       ) : (
    //         <Upload className="h-8 w-8 text-primary-foreground" />
    //       )}
    //     </div>

    //     <div className="space-y-2">
    //       <h3 className="text-xl font-semibold">
    //         {isDragActive ? "Drop your video here" : "Upload your video"}
    //       </h3>
    //       <p className="text-muted-foreground">
    //         Drag and drop or click to select a video file
    //       </p>
    //       <p className="text-sm text-muted-foreground">
    //         Supports MP4, MOV, WebM, AVI, MKV (Max 100MB)
    //       </p>
    //     </div>

    //     {!isDragActive && !isProcessing && (
    //       <Button variant="outline" size="lg" className="mt-4">
    //         Choose File
    //       </Button>
    //     )}

    //     {error && (
    //       <div className="flex items-center space-x-2 text-destructive mt-4">
    //         <AlertCircle className="h-4 w-4" />
    //         <span className="text-sm">{error}</span>
    //       </div>
    //     )}
    //   </div>
    // </Card>
  );
};

export default VideoUploader;
