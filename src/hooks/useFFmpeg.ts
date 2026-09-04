import { useState, useCallback, useRef } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpegInstance, loadFFmpeg } from "../lib/ffmpegService";

export interface SplitResult {
  name: string;
  blob: Blob;
}

export interface UseFFmpegReturn {
  isLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  initFFmpeg: () => Promise<void>;
  trimVideo: (file: File, startTime: number, endTime: number) => Promise<Blob>;
  splitVideo: (file: File, segmentDuration?: number) => Promise<SplitResult[]>;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef =
    useRef<ReturnType<typeof getFFmpegInstance>>(getFFmpegInstance());

  const initFFmpeg = useCallback(async (): Promise<void> => {
    if (ffmpegRef.current.loaded) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loadFFmpeg((prog) => setProgress(prog));
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to initialize FFmpeg:", err);
      setError("Failed to load video processing engine.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trimVideo = useCallback(
    async (file: File, startTime: number, endTime: number): Promise<Blob> => {
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg.loaded) {
        await initFFmpeg();
      }

      setProgress(0);

      const inputName = "input_video.mp4";
      const outputName = "output_trimmed.mp4";

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        await ffmpeg.exec([
          "-ss",
          startTime.toString(),
          "-to",
          endTime.toString(),
          "-i",
          inputName,
          "-c",
          "copy",
          outputName,
        ]);

        const data = (await ffmpeg.readFile(outputName)) as Uint8Array;

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        return new Blob([data.buffer as ArrayBuffer], {
          type: file.type || "video/mp4",
        });
      } catch (err) {
        console.error("Trimming error:", err);
        throw new Error("Failed to trim video file.");
      }
    },
    [initFFmpeg],
  );

  const splitVideo = useCallback(
    async (file: File, segmentDuration = 30): Promise<SplitResult[]> => {
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg.loaded) {
        await initFFmpeg();
      }

      setProgress(0);

      const inputName = "input_video.mp4";
      const outputPattern = "output_%03d.mp4";

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        await ffmpeg.exec([
          "-i",
          inputName,
          "-c",
          "copy",
          "-map",
          "0",
          "-segment_time",
          segmentDuration.toString(),
          "-f",
          "segment",
          "-reset_timestamps",
          "1",
          outputPattern,
        ]);

        const files = (await ffmpeg.listDir("/")) as Array<{
          name: string;
          isDir: boolean;
        }>;
        const segmentFiles = files.filter(
          (f) => !f.isDir && f.name.startsWith("output_"),
        );

        const results: SplitResult[] = [];

        for (const seg of segmentFiles) {
          const data = (await ffmpeg.readFile(seg.name)) as Uint8Array;
          const blob = new Blob([data.buffer as ArrayBuffer], {
            type: file.type || "video/mp4",
          });
          results.push({ name: seg.name, blob });
          await ffmpeg.deleteFile(seg.name);
        }

        await ffmpeg.deleteFile(inputName);

        return results;
      } catch (err) {
        console.error("Splitting error:", err);
        throw new Error("Failed to split video file.");
      }
    },
    [initFFmpeg],
  );

  return {
    isLoaded,
    isLoading,
    progress,
    error,
    initFFmpeg,
    trimVideo,
    splitVideo,
  };
}
