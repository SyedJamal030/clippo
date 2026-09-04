import {
  CameraIcon,
  CircleFadingPlusIcon,
  ClockIcon,
  DownloadIcon,
  ShieldIcon,
  ZapIcon,
} from 'lucide-react';

export const whyChooseUs = [
  {
    title: '100% Private & Local',
    description:
      'Your videos never leave your device. WebAssembly and Web Workers handle all processing entirely client-side.',
    Icon: ShieldIcon,
  },
  {
    title: 'Zero Upload Times',
    description:
      'Edits process instantly regardless of your internet connection speed because no heavy media is uploaded to cloud servers.',
    Icon: ZapIcon,
  },
  {
    title: 'Platform Auto-Splitting',
    description:
      'Automatically slice long footage into seamless, platform-ready segments for WhatsApp Status, Reels, TikTok, and Shorts.',
    Icon: CircleFadingPlusIcon,
  },
  {
    title: 'Precise Trimming',
    description:
      'Fine-tune start and end boundaries with an intuitive timeline interface designed for precise mobile and desktop editing.',
    Icon: ClockIcon,
  },
  {
    title: 'One-Click ZIP Downloads',
    description:
      'Export generated clips individually or bundle all sequential segments instantly into a single compressed archive.',
    Icon: DownloadIcon,
  },
  {
    title: 'No Quality Degradation',
    description:
      'Retain original source clarity and audio fidelity without unnecessary re-encoding or compression artifacts.',
    Icon: CameraIcon,
  },
];
