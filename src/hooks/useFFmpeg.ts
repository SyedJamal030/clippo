import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface ProcessingProgress {
  progress: number;
  stage: string;
}

export const useFFmpeg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    progress: 0,
    stage: "Initializing...",
  });
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadFFmpeg = useCallback(async () => {
    if (isReady && ffmpegRef.current) return;

    setIsLoading(true);
    setProgress({ progress: 0, stage: "Loading FFmpeg..." });

    try {
      const ffmpeg = new FFmpeg();

      // Set up progress handler
      ffmpeg.on("progress", ({ progress: prog }) => {
        setProgress((prev) => ({ ...prev, progress: prog * 100 }));
      });

      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg log:", message);
      });

      // Load FFmpeg with CDN URLs
      const baseURL =
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });

      ffmpegRef.current = ffmpeg;
      setIsReady(true);
      setProgress({ progress: 100, stage: "Ready" });
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      setProgress({ progress: 0, stage: "Failed to load FFmpeg" });
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  const trimVideo = useCallback(
    async (
      videoFile: File,
      startTime: number,
      endTime: number,
      outputName: string = "output.mp4"
    ): Promise<Uint8Array | null> => {
      if (!ffmpegRef.current || !isReady) {
        await loadFFmpeg();
      }

      if (!ffmpegRef.current) return null;

      setIsLoading(true);
      setProgress({ progress: 0, stage: "Preparing video..." });

      try {
        const ffmpeg = ffmpegRef.current;

        // Write input file
        const inputName = "input.mp4";
        await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        setProgress({ progress: 20, stage: "Trimming video..." });

        // Calculate duration
        const duration = endTime - startTime;

        // Execute FFmpeg command for trimming
        await ffmpeg.exec([
          "-i",
          inputName,
          "-ss",
          startTime.toString(),
          "-t",
          duration.toString(),
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-preset",
          "ultrafast",
          "-movflags",
          "+faststart",
          outputName,
        ]);

        setProgress({ progress: 90, stage: "Finalizing..." });

        // Read output file
        const data = await ffmpeg.readFile(outputName);

        // Clean up files
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        setProgress({ progress: 100, stage: "Complete" });
        return data as Uint8Array;
      } catch (error) {
        console.error("Video trimming failed:", error);
        setProgress({ progress: 0, stage: "Processing failed" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isReady, loadFFmpeg]
  );

  const splitVideoForWhatsApp = useCallback(
    async (
      videoFile: File,
      segmentDuration: number = 60,
      startTime: number = 0,
      endTime?: number
    ): Promise<Uint8Array[]> => {
      if (!ffmpegRef.current || !isReady) {
        await loadFFmpeg();
      }

      if (!ffmpegRef.current) return [];

      setIsLoading(true);
      setProgress({ progress: 0, stage: "Analyzing video..." });

      try {
        const ffmpeg = ffmpegRef.current;

        // Write input file
        const inputName = "input.mp4";
        await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        // Get video duration
        await ffmpeg.exec(["-i", inputName, "-f", "null", "-"]);

        // Create a temporary video element to get duration
        const videoUrl = URL.createObjectURL(videoFile);
        const video = document.createElement("video");
        video.src = videoUrl;

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        const totalDuration = video.duration;
        URL.revokeObjectURL(videoUrl);

        // Use provided range or full video
        const actualEndTime = endTime || totalDuration;
        const trimmedDuration = actualEndTime - startTime;
        const segments = Math.ceil(trimmedDuration / segmentDuration);
        const results: Uint8Array[] = [];

        for (let i = 0; i < segments; i++) {
          const segmentStart = startTime + i * segmentDuration;
          const segmentEnd = Math.min(
            segmentStart + segmentDuration,
            actualEndTime
          );
          const duration = segmentEnd - segmentStart;

          setProgress({
            progress: (i / segments) * 100,
            stage: `Processing segment ${i + 1} of ${segments}...`,
          });

          const outputName = `segment_${i + 1}.mp4`;

          await ffmpeg.exec([
            "-i",
            inputName,
            "-ss",
            segmentStart.toString(),
            "-t",
            duration.toString(),
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-preset",
            "ultrafast",
            "-movflags",
            "+faststart",
            outputName,
          ]);

          const data = await ffmpeg.readFile(outputName);
          results.push(data as Uint8Array);

          await ffmpeg.deleteFile(outputName);
        }

        await ffmpeg.deleteFile(inputName);
        setProgress({ progress: 100, stage: `Created ${segments} segments` });

        return results;
      } catch (error) {
        console.error("Video splitting failed:", error);
        setProgress({ progress: 0, stage: "Processing failed" });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isReady, loadFFmpeg]
  );

  return {
    isLoading,
    isReady,
    progress,
    loadFFmpeg,
    trimVideo,
    splitVideoForWhatsApp,
  };
};
