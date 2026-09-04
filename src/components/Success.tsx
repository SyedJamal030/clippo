import { useCallback, useState } from 'react';
import { DownloadIcon, FilmIcon, MoveLeftIcon, VerifiedIcon } from 'lucide-react';
import JSZip from 'jszip';

import type { SplitResult } from '../hooks/useFFmpeg';

import { formatTime } from './player/util/time';
import type { Mode } from './VideoTrimmer';

interface Props {
  onBackToEditor: () => void;
  splitResults: SplitResult[];
  file: File | null;
  segmentDuration: number;
  duration: number;
  startTime: number;
  endTime: number;
  downloadUrl: string | null;
  mode: Mode;
}

const Success = ({
  onBackToEditor,
  file,
  splitResults,
  duration,
  mode,
  segmentDuration,
  endTime,
  startTime,
  downloadUrl,
}: Props) => {
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  const createZipFile = useCallback(async () => {
    const zip = new JSZip();
    const rawName = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'video';

    splitResults.forEach((result, index) => {
      const fileName = `${rawName}_part_${index + 1}.mp4`;
      zip.file(fileName, result.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      setZipProgress(Math.round(metadata.percent));
    });

    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${rawName}_whatsapp_clips.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
  }, [file, splitResults]);

  const handleDownloadZip = useCallback(() => {
    if (splitResults.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);

    createZipFile()
      .catch((err) => {
        console.error('Failed to create ZIP archive:', err);
        alert('Could not generate ZIP archive.');
      })
      .finally(() => setIsZipping(false));
  }, [createZipFile, splitResults.length]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 select-none">
      <div className="card bg-transparent w-96 max-w-full shadow-none mx-auto card-xs">
        <figure className="px-10 text-success">
          <VerifiedIcon className="size-12" />
        </figure>
        <div className="card-body items-center text-center gap-.5">
          <h2 className="card-title font-medium dark:text-neutral-content">
            Video processed successfully!
          </h2>
          <p className="text-base-content/60">
            {mode === 'trim'
              ? 'Your video clip has been trimmed and optimized for download.'
              : `Your video has been split into ${splitResults.length} optimized segments.`}
          </p>
        </div>
      </div>

      <div className="card border border-base-content/10 overflow-hidden w-full bg-base-100 shadow-sm">
        <div className="card-body bg-base-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title dark:text-neutral-content">
                {mode === 'trim' ? 'Trimmed Clip Result' : 'Split Results'}
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Ready for download your {mode === 'trim' ? 'trimmed video' : 'split results'}
              </p>
            </div>
            {mode === 'split' && (
              <button
                type="button"
                disabled={isZipping}
                onClick={handleDownloadZip}
                className="btn btn-primary md:btn-sm btn-xs gap-2 font-bold shadow-md self-start sm:self-auto"
              >
                <DownloadIcon className="size-4" />
                {isZipping ? `Compressing ZIP... (${zipProgress}%)` : 'Download All'}
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {mode === 'trim' && downloadUrl && (
            <div role="alert" className="alert overflow-hidden">
              <div className="badge badge-xl !rounded-lg badge-soft badge-primary">
                <FilmIcon className="size-4 justify-self-end" />
              </div>

              {/* Add min-w-0 and flex-1 here */}
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="font-bold truncate">
                  {file?.name ? `trimmed_${file.name}` : 'trimmed_video.mp4'}
                </h3>
                <div className="text-xs">
                  {formatTime(startTime).split('.')[0]} - {formatTime(endTime).split('.')[0]}
                </div>
              </div>

              <a
                href={downloadUrl}
                download={`trimmed_${file?.name ?? 'video.mp4'}`}
                className="btn btn-sm btn-primary btn-sm"
                title='Download Clip'
              >
                <DownloadIcon className="size-3.5" />
                <span className='max-sm:hidden'>Download Clip</span>
              </a>
            </div>
          )}

          {/* MULTI-SEGMENT SPLIT MODE GRID */}
          {mode === 'split' && splitResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {splitResults.map((result, index) => {
                const url = URL.createObjectURL(result.blob);
                const startSec = index * segmentDuration;
                const endSec = Math.min((index + 1) * segmentDuration, duration);

                return (
                  <div
                    role="alert"
                    key={result.name || index}
                    className="alert alert-horizontal grid-flow-row"
                  >
                    <div>
                      <h3 className="font-bold truncate">Part {index + 1}</h3>
                      <div className="font-mono text-xs text-primary">
                        {formatTime(startSec).split('.')[0]} - {formatTime(endSec).split('.')[0]}
                      </div>
                    </div>
                    <FilmIcon className="size-4 justify-self-end" />
                    <a
                      href={url}
                      download={`part_${index + 1}_${file?.name ?? 'video.mp4'}`}
                      className="btn btn-sm btn-neutral hover:btn-primary w-full col-span-full"
                    >
                      <DownloadIcon className="size-3.5" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="card-actions py-4 border-t border-base-content/10">
          <button type="button" onClick={onBackToEditor} className="btn btn-ghost btn-sm mx-auto">
            <MoveLeftIcon className="size-4" />
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
