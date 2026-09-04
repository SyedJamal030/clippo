import {
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeOffIcon,
} from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { formatTime } from './util/time';

export interface VideoPlayerProps {
  src: string;
  startTime: number;
  endTime: number;
  duration: number;
  onTimeUpdate?: (time: number) => void;
  onLoadedMetadata?: (duration: number) => void;
}

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src, startTime, endTime, duration, onTimeUpdate, onLoadedMetadata }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        const time = video.currentTime;

        if (!video.paused) {
          if (time >= endTime) {
            video.currentTime = startTime;
            video.pause();
            setIsPlaying(false);
          } else if (time < startTime) {
            video.currentTime = startTime;
          }
        }

        onTimeUpdate?.(video.currentTime);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }, [startTime, endTime, onTimeUpdate]);

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
        if (!isMuted) {
          videoRef.current.volume = 1.0;
        }
      }
    }, [isMuted]);

    const togglePlay = useCallback(() => {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play().catch(() => console.warn('Error playing the video'));
      }
    }, [endTime, isPlaying, startTime]);

    const toggleMute = useCallback(() => {
      setIsMuted((prev) => {
        if (!videoRef.current) return prev;
        const nextMute = !prev;
        videoRef.current.muted = nextMute;
        return nextMute;
      });
    }, []);

    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current
          .requestFullscreen()
          .catch(() => console.warn('failed to go fullscreen'));
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => console.warn('failed to exit fullscreen'));
        setIsFullscreen(false);
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className="group relative aspect-video w-full select-none overflow-hidden rounded-xl bg-black shadow-lg"
      >
        <video
          src={src}
          playsInline
          ref={videoRef}
          className="h-full w-full cursor-pointer object-contain"
          onClick={togglePlay}
          onLoadedMetadata={(e) => onLoadedMetadata?.(e.currentTarget.duration)}
        />

        {/* Top-Right Controls: Always Visible Mute Toggle & Fullscreen */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="btn btn-circle bg-black/60 border-none text-white backdrop-blur transition-transform hover:scale-105 active:scale-95 focus:outline-none max-md:btn-sm"
          >
            {isMuted ? (
              <VolumeOffIcon className="md:size-4 size-3" />
            ) : (
              <Volume2Icon className="md:size-4 size-3" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="btn btn-circle bg-black/60 border-none text-white backdrop-blur transition-transform hover:scale-105 active:scale-95 focus:outline-none max-md:btn-sm"
          >
            {isFullscreen ? (
              <MinimizeIcon className="md:size-4 size-3" />
            ) : (
              <MaximizeIcon className="md:size-4 size-3" />
            )}
          </button>
        </div>

        {/* Bottom-Center Play/Pause Button */}
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 w-full inline-flex items-center justify-between px-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="btn btn-circle bg-black/60 border-none text-white backdrop-blur transition-transform hover:scale-105 active:scale-95 focus:outline-none max-md:btn-sm"
          >
            {isPlaying ? (
              <PauseIcon className="md:size-4 size-3" />
            ) : (
              <PlayIcon className="md:size-4 size-3" />
            )}
          </button>

          <div className="badge badge-neutral badge-sm">
            {formatTime(duration, duration >= 3600).split('.')[0]}
          </div>
        </div>
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
