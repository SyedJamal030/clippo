import { useEffect, useRef, useState } from 'react';

interface ThumbnailStripProps {
  videoFile: Blob | null;
  videoUrl?: string;
  samplesCount?: number;
}

/**
 * Extracts evenly-spaced frames from a video using an off-screen canvas
 * and renders them as a horizontal filmstrip. Runs entirely client-side.
 */
export default function ThumbnailStrip({
  videoFile,
  videoUrl,
  samplesCount = 12,
}: ThumbnailStripProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const src = videoFile ? URL.createObjectURL(videoFile) : videoUrl;
    if (!src) return;

    cancelledRef.current = false;
    setIsLoading(true);
    setThumbnails([]);

    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const generate = async (): Promise<string[]> => {
      const duration = video.duration;
      if (!ctx || !Number.isFinite(duration) || duration <= 0) {
        throw new Error('Invalid video context, missing duration, or non-positive value.');
      }

      canvas.width = 160;
      canvas.height = Math.round((video.videoHeight / video.videoWidth) * 160) || 90;

      const generated: string[] = [];

      for (let i = 0; i < samplesCount; i++) {
        if (cancelledRef.current) {
          throw new Error('Thumbnail generation was cancelled.');
        }

        const time = samplesCount === 1 ? 0 : (duration / (samplesCount - 1)) * i;
        video.currentTime = Math.min(time, Math.max(duration - 0.05, 0));

        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => {
            if (cancelledRef.current) {
              video.removeEventListener('seeked', onSeeked);
              reject(new Error('Thumbnail generation was cancelled.'));
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            generated.push(canvas.toDataURL('image/jpeg', 0.6));
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });
      }

      if (cancelledRef.current) {
        throw new Error('Thumbnail generation was cancelled.');
      }

      return generated;
    };

    video.onloadedmetadata = () => {
      generate()
        .then((generated) => setThumbnails(generated))
        .catch((error) => alert(error))
        .finally(() => setIsLoading(false));
    };

    video.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      cancelledRef.current = true;
      if (videoFile) URL.revokeObjectURL(src);
    };
  }, [videoFile, videoUrl, samplesCount]);

  if (isLoading) {
    return (
      <div className="flex h-14 w-full items-center justify-center rounded-lg bg-base-100 space-x-1 overflow-hidden">
        {Array.from({ length: samplesCount }, (_, i) => i).map((k) => (
          <div key={k} className="skeleton h-32 w-32 rounded-sm"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-14 w-full gap-0.5 overflow-hidden rounded-lg bg-base-300 select-none">
      {thumbnails.map((src, index) => (
        <img
          key={index}
          src={src}
          className="h-full flex-1 min-w-0 object-cover pointer-events-none"
          alt={`Frame ${index}`}
          draggable={false}
        />
      ))}
    </div>
  );
}
