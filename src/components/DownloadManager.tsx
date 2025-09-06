import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  VStack,
  HStack,
  Card,
  Spinner,
  Icon,
} from "@chakra-ui/react";

import { Check, Download, FileVideo, Trash2 } from "lucide-react";

export interface VideoSegment {
  id: string;
  name: string;
  data: Uint8Array;
  duration: number;
  downloaded: boolean;
}

interface DownloadManagerProps {
  segments: VideoSegment[];
  onDownload: (segment: VideoSegment) => void;
  onDownloadAll: () => void;
  onClear: () => void;
}

export const DownloadManager = ({
  segments,
  onDownload,
  onDownloadAll,
  onClear,
}: DownloadManagerProps) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  if (segments.length === 0) return null;

  const handleDownload = async (segment: VideoSegment) => {
    setDownloadingIds((prev) => new Set(prev).add(segment.id));
    await onDownload(segment);
    setDownloadingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(segment.id);
      return newSet;
    });
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const allDownloaded = segments.every((segment) => segment.downloaded);

  return (
    <Box className="app" p={6} maxW="6xl" mx="auto">
      <Card.Root
        p={6}
        bgGradient="linear(to-br, #2b6cb0, #805ad5)"
        boxShadow="lg"
        color="white"
      >
        <Card.Body p={0}>
          <VStack gap={4} align="stretch">
            {/* Header */}
            <Flex alignItems="center" justifyContent="space-between">
              <HStack gap={2} alignItems="center">
                <Icon as={FileVideo} w={5} h={5} color="teal.300" />
                <Heading as="h3" size="md" fontWeight="semibold">
                  Processed Videos
                </Heading>
                <Text fontSize="sm" color="gray.300">
                  ({segments.length} segment{segments.length !== 1 ? "s" : ""})
                </Text>
              </HStack>

              <HStack gap={2}>
                <Button
                  onClick={onDownloadAll}
                  size="sm"
                  disabled={allDownloaded}
                  bgGradient="linear(to-r, #7928CA, #FF0080)"
                  _hover={{ bgGradient: "linear(to-r, #FF0080, #7928CA)" }}
                  color="white"
                >
                  <Icon as={Download} w={4} h={4} mr={2} />
                  Download All
                </Button>
                <Button
                  onClick={onClear}
                  variant="outline"
                  size="sm"
                  colorScheme="gray"
                >
                  <Icon as={Trash2} w={4} h={4} />
                </Button>
              </HStack>
            </Flex>

            {/* Segments List */}
            <VStack gap={3} align="stretch">
              {segments.map((segment, index) => (
                <Flex
                  key={segment.id}
                  alignItems="center"
                  justifyContent="space-between"
                  p={4}
                  rounded="lg"
                  border="1px"
                  borderColor={segment.downloaded ? "green.400" : "gray.200"}
                  bg={segment.downloaded ? "green.700" : "gray.700"}
                  transition="all 0.2s"
                  _hover={{ bg: segment.downloaded ? "green.600" : "gray.600" }}
                >
                  <HStack gap={3}>
                    <Box flexShrink={0}>
                      <Flex
                        w={10}
                        h={10}
                        rounded="lg"
                        bg="teal.400"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.800"
                        >
                          {index + 1}
                        </Text>
                      </Flex>
                    </Box>

                    <Box flex={1} minW={0}>
                      <Text fontWeight="medium" truncate>
                        {segment.name}
                      </Text>
                      <HStack gap={4} fontSize="sm" color="gray.300">
                        <Text>
                          Duration: {formatDuration(segment.duration)}
                        </Text>
                        <Text>Size: {formatFileSize(segment.data.length)}</Text>
                      </HStack>
                    </Box>
                  </HStack>

                  <HStack gap={2}>
                    {segment.downloaded && (
                      <HStack
                        alignItems="center"
                        color="green.300"
                        fontSize="sm"
                      >
                        <Icon as={Check} w={4} h={4} mr={1} />
                        <Text>Downloaded</Text>
                      </HStack>
                    )}

                    <Button
                      onClick={() => handleDownload(segment)}
                      variant={segment.downloaded ? "outline" : "solid"}
                      size="sm"
                      colorScheme={segment.downloaded ? "green" : "teal"}
                      disabled={downloadingIds.has(segment.id)}
                    >
                      {downloadingIds.has(segment.id) ? (
                        <Spinner size="xs" color="gray.200" />
                      ) : (
                        <Icon as={Download} w={4} h={4} />
                      )}
                    </Button>
                  </HStack>
                </Flex>
              ))}
            </VStack>

            {/* Summary */}
            <Box pt={4} borderTop="1px" borderColor="gray.600">
              <Flex
                justifyContent="space-between"
                fontSize="sm"
                color="gray.300"
              >
                <Text>
                  Total size:{" "}
                  {formatFileSize(
                    segments.reduce((sum, seg) => sum + seg.data.length, 0)
                  )}
                </Text>
                <Text>
                  {segments.filter((s) => s.downloaded).length} of{" "}
                  {segments.length} downloaded
                </Text>
              </Flex>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
  //   return (
  //     <Card className="p-6 bg-gradient-video shadow-card">
  //       <div className="space-y-4">
  //         {/* Header */}
  //         <div className="flex items-center justify-between">
  //           <div className="flex items-center space-x-2">
  //             <FileVideo className="h-5 w-5 text-primary" />
  //             <h3 className="font-semibold">Processed Videos</h3>
  //             <span className="text-sm text-muted-foreground">
  //               ({segments.length} segment{segments.length !== 1 ? "s" : ""})
  //             </span>
  //           </div>

  //           <div className="flex space-x-2">
  //             <Button
  //               onClick={onDownloadAll}
  //               size="sm"
  //               disabled={allDownloaded}
  //               className="bg-gradient-primary"
  //             >
  //               <Download className="h-4 w-4 mr-2" />
  //               Download All
  //             </Button>
  //             <Button onClick={onClear} variant="outline" size="sm">
  //               <Trash2 className="h-4 w-4" />
  //             </Button>
  //           </div>
  //         </div>

  //         {/* Segments List */}
  //         <div className="space-y-3">
  //           {segments.map((segment, index) => (
  //             <div
  //               key={segment.id}
  //               className={cn(
  //                 "flex items-center justify-between p-4 rounded-lg border",
  //                 "transition-all duration-200 hover:bg-muted/50",
  //                 segment.downloaded && "bg-green-500/10 border-green-500/20"
  //               )}
  //             >
  //               <div className="flex items-center space-x-3">
  //                 <div className="flex-shrink-0">
  //                   <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
  //                     <span className="text-sm font-medium text-primary">
  //                       {index + 1}
  //                     </span>
  //                   </div>
  //                 </div>

  //                 <div className="flex-1 min-w-0">
  //                   <p className="font-medium truncate">{segment.name}</p>
  //                   <div className="flex items-center space-x-4 text-sm text-muted-foreground">
  //                     <span>Duration: {formatDuration(segment.duration)}</span>
  //                     <span>Size: {formatFileSize(segment.data.length)}</span>
  //                   </div>
  //                 </div>
  //               </div>

  //               <div className="flex items-center space-x-2">
  //                 {segment.downloaded && (
  //                   <div className="flex items-center text-green-500 text-sm">
  //                     <Check className="h-4 w-4 mr-1" />
  //                     Downloaded
  //                   </div>
  //                 )}

  //                 <Button
  //                   onClick={() => handleDownload(segment)}
  //                   variant={segment.downloaded ? "outline" : "solid"}
  //                   size="sm"
  //                   disabled={downloadingIds.has(segment.id)}
  //                 >
  //                   {downloadingIds.has(segment.id) ? (
  //                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
  //                   ) : (
  //                     <Download className="h-4 w-4" />
  //                   )}
  //                 </Button>
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         {/* Summary */}
  //         <div className="pt-4 border-t border-border">
  //           <div className="flex justify-between text-sm text-muted-foreground">
  //             <span>
  //               Total size:{" "}
  //               {formatFileSize(
  //                 segments.reduce((sum, seg) => sum + seg.data.length, 0)
  //               )}
  //             </span>
  //             <span>
  //               {segments.filter((s) => s.downloaded).length} of {segments.length}{" "}
  //               downloaded
  //             </span>
  //           </div>
  //         </div>
  //       </div>
  //     </Card>
  //   );
};

export default DownloadManager;
