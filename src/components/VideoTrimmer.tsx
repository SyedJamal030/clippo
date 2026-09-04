import { useState, useRef, useCallback, Fragment } from 'react';

import { useFFmpeg, type SplitResult } from '../hooks/useFFmpeg';

import FileUploader from './file/FileUploader';
import VideoPlayer, { type VideoPlayerHandle } from './player/VideoPlayer';
import TimelineSelector from './player/TimelineSelector';
import TimeInputs from './player/TimeInputs';
import { formatTime } from './player/util/time';
import { FileExclamationPointIcon, ReplaceIcon } from 'lucide-react';
import { revokeUrl } from './file/util/uploader';

import Success from './Success';

export type Mode = 'trim' | 'split';

interface Props {
  mode?: Mode;
  segmentDuration?: number;
  helperText?: string;
}

export default function VideoTrimmer({ mode = 'trim', segmentDuration = 30 }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string[]>([]);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isVideoTrimmedSuccessfully, setIsVideoTrimmedSuccessfully] = useState<boolean>(false);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const playerRef = useRef<VideoPlayerHandle>(null);
  const { isLoaded, isLoading, progress, error, initFFmpeg, trimVideo, splitVideo } = useFFmpeg();

  // Soft Reset: Clears export result states (Back to Editor)
  const softReset = useCallback(() => {
    setDownloadUrl((prev) => {
      revokeUrl(prev);
      return null;
    });
    setIsProcessing(false);
    setIsVideoTrimmedSuccessfully(false);
    setSplitResults([]);
  }, []);

  // Full Reset: Wipes video, file, and player states completely
  const fullReset = useCallback(() => {
    softReset();
    setVideoSrc((prev) => {
      revokeUrl(prev);
      return null;
    });
    setFile(null);
    setFileError([]);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
  }, [softReset]);

  const handleFileChange = useCallback(
    (files: File[]) => {
      setFileError([]);
      fullReset();

      const [selectedFile] = files;
      if (!selectedFile) {
        return;
      }

      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoSrc(url);

      if (!isLoaded) {
        initFFmpeg().catch(() => {
          setFileError(['Failed to initialize video processor.']);
          fullReset();
        });
      }
    },
    [fullReset, initFFmpeg, isLoaded],
  );

  const handleRangeChange = useCallback(
    (start: number, end: number): void => {
      setStartTime(start);
      setEndTime(end);
      if (currentTime < start || currentTime > end) {
        playerRef.current?.seekTo(start);
        setCurrentTime(start);
      }
    },
    [currentTime],
  );

  const processVideoFile = useCallback(async () => {
    if (!file) {
      throw new Error('Unable to read selected video file.');
    }

    if (mode === 'trim') {
      const trimmedBlob = await trimVideo(file, startTime, endTime);
      const url = URL.createObjectURL(trimmedBlob);
      setDownloadUrl(url);
    } else {
      const isFullRange = startTime === 0 && endTime === duration;

      let targetFile: File = file;
      if (!isFullRange) {
        const trimmedBlob = await trimVideo(file, startTime, endTime);
        targetFile = new File([trimmedBlob], file.name, {
          type: trimmedBlob.type || file.type,
          lastModified: Date.now(),
        });
      }

      const results = await splitVideo(targetFile, segmentDuration);
      setSplitResults(results);
    }
  }, [duration, endTime, file, mode, segmentDuration, splitVideo, startTime, trimVideo]);

  const handleProcess = useCallback(() => {
    softReset();
    setIsProcessing(true);

    processVideoFile()
      .then(() => setIsVideoTrimmedSuccessfully(true))
      .catch((err) => {
        console.error(err);
        alert('Error processing video file.');
        setIsVideoTrimmedSuccessfully(false);
      })
      .finally(() => setIsProcessing(false));
  }, [processVideoFile, softReset]);

  const handleLoadedMetadata = useCallback((metaDuration: number) => {
    setDuration(metaDuration);
    setStartTime(0);
    setEndTime(metaDuration);
    setCurrentTime(0);
  }, []);

  const handleScrub = useCallback((time: number) => {
    playerRef.current?.pause();
    playerRef.current?.seekTo(time);
    setCurrentTime(time);
  }, []);

  const selectedDuration = Math.max(0, endTime - startTime);
  const totalParts = Math.ceil(selectedDuration / (segmentDuration || 1));

  return (
    <section className="text-gray-600 body-font">
      <div className="max-w-4xl px-5 py-10 mx-auto">
        <div className={`mb-3 w-full space-y-3 ${isVideoTrimmedSuccessfully ? 'hidden' : ''}`}>
          <FileUploader
            onError={setFileError}
            onFilesChange={handleFileChange}
            maxSizeBytes={100 * 1024 * 1024}
            removeText={
              <span title="Replace Video">
                <ReplaceIcon className="size-3 sm:hidden" />
                <span className="max-sm:hidden">Replace Video</span>
              </span>
            }
            accept="video/*"
          />
          {isLoading && (
            <div role="alert" className="alert alert-info alert-soft">
              <span className="loading loading-spinner"></span>
              <span>Loading WebAssembly engine... ({progress}%)</span>
            </div>
          )}

          {(error ?? (fileError && fileError.length > 0)) && (
            <div role="alert" className="alert alert-error alert-soft">
              <FileExclamationPointIcon className="size-6" />
              <span>{error ?? fileError}</span>
            </div>
          )}
        </div>

        <div
          className={`flex flex-col items-center justify-center w-full mx-auto ${isVideoTrimmedSuccessfully ? 'hidden' : ''}`}
        >
          {videoSrc && (
            <Fragment>
              <VideoPlayer
                ref={playerRef}
                src={videoSrc}
                startTime={startTime}
                endTime={endTime}
                duration={duration}
                onTimeUpdate={setCurrentTime}
                onLoadedMetadata={handleLoadedMetadata}
              />
              {duration > 0 && (
                <div className="flex flex-col w-full gap-3">
                  <TimelineSelector
                    videoFile={file}
                    videoUrl={videoSrc}
                    duration={duration}
                    startTime={startTime}
                    endTime={endTime}
                    currentTime={currentTime}
                    onChange={handleRangeChange}
                    onScrub={handleScrub}
                  />

                  <TimeInputs
                    startTime={startTime}
                    endTime={endTime}
                    duration={duration}
                    onChange={handleRangeChange}
                  />

                  {mode === 'split' && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-base-200 border border-base-content/15 space-y-3 transition-all">
                      {/* Header & Calculated Output Badge */}
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs uppercase tracking-wider text-base-content/70">
                          Segment Duration
                        </label>
                        <div className="badge badge-sm bg-primary/15 text-primary border-primary/20 font-mono font-bold">
                          {totalParts} {totalParts === 1 ? 'Part' : 'Parts'}
                        </div>
                      </div>

                      {/* Helper Summary */}
                      <p className="text-xs text-base-content/60 leading-relaxed">
                        Splits your{' '}
                        <span className="font-mono font-bold text-base-content">
                          {formatTime(selectedDuration, selectedDuration >= 3600).split('.')[0]}
                        </span>{' '}
                        selected range into{' '}
                        <span className="font-mono font-bold text-base-content">
                          {totalParts} downloadable clip
                          {totalParts === 1 ? '' : 's'}
                        </span>{' '}
                        without re-encoding.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || !isLoaded}
                className="btn btn-success mx-auto md:btn-wide max-md:btn-block mt-4"
              >
                {isProcessing
                  ? `Processing Clips... (${progress}%)`
                  : mode === 'trim'
                    ? 'Trim Video Clip'
                    : `Split into ${segmentDuration}s Clips`}
              </button>
            </Fragment>
          )}
        </div>
        {isVideoTrimmedSuccessfully && (
          <Success
            endTime={endTime}
            file={file}
            mode={mode}
            onBackToEditor={softReset}
            segmentDuration={segmentDuration}
            splitResults={splitResults}
            startTime={startTime}
            downloadUrl={downloadUrl}
            duration={duration}
          />
        )}
      </div>
    </section>
  );
}
