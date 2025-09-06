import React from "react";
import {
  Progress as ChakraProgress,
  Box,
  Flex,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Loader2 } from "lucide-react";

import type { ProcessingProgress as ProgressType } from "@/hooks/useFFmpeg";

interface ProcessingProgressProps {
  progress: ProgressType;
  isVisible: boolean;
}
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
export const ProcessingProgress = ({
  progress,
  isVisible,
}: ProcessingProgressProps) => {
  if (!isVisible) return null;

  return (
    <Box
      p={6}
      bgGradient="linear(to-br, #2a2a2e, #1a1a1e)" // Assuming bg-gradient-video is a dark gradient
      boxShadow="lg" // Assuming shadow-card is a large shadow
      borderRadius="md" // Added for a card-like appearance
    >
      <VStack gap={4} align="stretch">
        <Flex alignItems="center" gap={3}>
          <Box
            as={Loader2}
            h={5}
            w={5}
            color="primary"
            animation={`${spin} 1s linear infinite`}
          />
          <Heading as="h3" size="md" fontWeight="semibold">
            Processing Video
          </Heading>
        </Flex>

        <VStack gap={2} align="stretch">
          <Flex justifyContent="space-between" fontSize="sm">
            <Text color="muted-foreground">{progress.stage}</Text>
            <Text fontWeight="medium">{Math.round(progress.progress)}%</Text>
          </Flex>
          <Progress
            value={progress.progress}
            size="sm"
            h={2}
            colorScheme="teal"
          />
        </VStack>

        <Text fontSize="xs" color="muted-foreground">
          Please wait while we process your video. Do not close this tab.
        </Text>
      </VStack>
    </Box>
    // <Card className="p-6 bg-gradient-video shadow-card">
    //   <div className="space-y-4">
    //     <div className="flex items-center space-x-3">
    //       <Loader2 className="h-5 w-5 animate-spin text-primary" />
    //       <h3 className="font-semibold">Processing Video</h3>
    //     </div>

    //     <div className="space-y-2">
    //       <div className="flex justify-between text-sm">
    //         <span className="text-muted-foreground">{progress.stage}</span>
    //         <span className="font-medium">
    //           {Math.round(progress.progress)}%
    //         </span>
    //       </div>

    //       <Progress value={progress.progress} className="h-2" />
    //     </div>

    //     <p className="text-xs text-muted-foreground">
    //       Please wait while we process your video. Do not close this tab.
    //     </p>
    //   </div>
    // </Card>
  );
};

export default ProcessingProgress;

interface ProgressProps extends ChakraProgress.RootProps {
  showValueText?: boolean;
  valueText?: React.ReactNode;
  label?: React.ReactNode;
  info?: React.ReactNode;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(props, ref) {
    const { showValueText, valueText, label, ...rest } = props;
    return (
      <ChakraProgress.Root {...rest} ref={ref}>
        {label && <ChakraProgress.Label>{label}</ChakraProgress.Label>}
        <ChakraProgress.Track>
          <ChakraProgress.Range />
        </ChakraProgress.Track>
        {showValueText && (
          <ChakraProgress.ValueText>{valueText}</ChakraProgress.ValueText>
        )}
      </ChakraProgress.Root>
    );
  }
);
