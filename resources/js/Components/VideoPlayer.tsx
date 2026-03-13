import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

interface Subtitle {
    url: string;
    lang: string;
}

interface VideoPlayerProps {
    url: string;
    subtitles?: Subtitle[];
    title?: string;
    startAt?: number;
    onProgress?: (seconds: number) => void;
    onEnded?: () => void;
}

export default function VideoPlayer({
    url,
    subtitles = [],
    title,
    startAt = 0,
    onProgress,
    onEnded,
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const artRef = useRef<Artplayer | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );

    useEffect(() => {
        if (!containerRef.current) return;

        const isHls =
            url.includes('.m3u8') || url.includes('m3u8');

        // Find English subtitle, default to first available
        const englishSub = subtitles.find(
            (s) => s.lang.toLowerCase().includes('english'),
        );
        const defaultSub = englishSub || subtitles[0];

        // Build subtitle selector for settings panel
        const subtitleSettings: Artplayer['option']['settings'] = subtitles.length > 0
            ? [
                  {
                      html: 'Subtitle',
                      width: 200,
                      tooltip: defaultSub?.lang || 'Off',
                      selector: [
                          {
                              html: 'Off',
                              default: !defaultSub,
                          },
                          ...subtitles.map((sub) => ({
                              html: sub.lang,
                              url: sub.url,
                              default: sub === defaultSub,
                          })),
                      ],
                      onSelect: function (item: { html: string; url?: string }) {
                          if (item.html === 'Off') {
                              art.subtitle.show = false;
                          } else if (item.url) {
                              art.subtitle.show = true;
                              art.subtitle.switch(item.url, { name: item.html });
                          }
                          return item.html;
                      },
                  },
              ]
            : [];

        const art = new Artplayer({
            container: containerRef.current,
            url,
            volume: 0.8,
            autoplay: false,
            pip: true,
            fullscreen: true,
            fullscreenWeb: true,
            playbackRate: true,
            aspectRatio: true,
            setting: true,
            hotkey: true,
            theme: '#7c3aed',
            subtitle: defaultSub
                ? {
                      url: defaultSub.url,
                      type: 'vtt',
                      encoding: 'utf-8',
                      style: {
                          color: '#fff',
                          fontSize: '20px',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      },
                  }
                : undefined,
            settings: [...subtitleSettings],
            customType: isHls
                ? {
                      m3u8: function (video: HTMLVideoElement, url: string) {
                          if (Hls.isSupported()) {
                              const hls = new Hls();
                              hls.loadSource(url);
                              hls.attachMedia(video);
                          } else if (
                              video.canPlayType(
                                  'application/vnd.apple.mpegurl',
                              )
                          ) {
                              video.src = url;
                          }
                      },
                  }
                : undefined,
            type: isHls ? 'm3u8' : undefined,
        });

        artRef.current = art;

        // Seek to saved position
        if (startAt > 0) {
            art.on('ready', () => {
                art.currentTime = startAt;
            });
        }

        // Progress reporting
        if (onProgress) {
            progressIntervalRef.current = setInterval(() => {
                if (art.playing) {
                    onProgress(Math.floor(art.currentTime));
                }
            }, 30000);
        }

        // Ended callback
        if (onEnded) {
            art.on('video:ended', onEnded);
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            art.destroy(false);
        };
    }, [url]);

    return (
        <div
            ref={containerRef}
            className="aspect-video w-full overflow-hidden rounded-lg"
        />
    );
}
