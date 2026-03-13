import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

interface Subtitle {
    url: string;
    lang: string;
}

interface TimeRange {
    start: number;
    end: number;
}

interface VideoPlayerProps {
    url: string;
    subtitles?: Subtitle[];
    title?: string;
    startAt?: number;
    intro?: TimeRange;
    outro?: TimeRange;
    onProgress?: (seconds: number) => void;
    onEnded?: () => void;
}

function stripHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
}

export default function VideoPlayer({
    url,
    subtitles = [],
    title,
    startAt = 0,
    intro,
    outro,
    onProgress,
    onEnded,
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const artRef = useRef<Artplayer | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );
    const [skipButton, setSkipButton] = useState<{
        label: string;
        target: number;
    } | null>(null);
    const skipDismissedRef = useRef<Set<string>>(new Set());

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
            theme: '#5DADE2',
            subtitle: defaultSub
                ? {
                      url: defaultSub.url,
                      type: 'vtt',
                      encoding: 'utf-8',
                      escape: false,
                      style: {
                          color: '#FFFFFF',
                          fontSize: '22px',
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: 'bold',
                          textShadow:
                              '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000',
                          padding: '0 8px',
                          bottom: '50px',
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

        // Strip HTML tags from subtitle cues
        (art as unknown as { on(name: string, fn: (...args: unknown[]) => void): void }).on(
            'subtitleUpdate',
            (text: unknown) => {
                if (typeof text !== 'string') return;
                const cleaned = stripHtmlTags(text);
                if (cleaned !== text) {
                    art.subtitle.show = true;
                    const subEl = art.template.$subtitle;
                    if (subEl) {
                        subEl.textContent = cleaned;
                    }
                }
            },
        );

        // Scale subtitles in fullscreen
        const updateSubSize = (isFs: boolean) => {
            const subEl = art.template.$subtitle;
            if (subEl) {
                subEl.style.fontSize = isFs ? '48px' : '22px';
                subEl.style.bottom = isFs ? '80px' : '50px';
            }
        };
        art.on('fullscreen', (state: boolean) => updateSubSize(state));
        art.on('fullscreenWeb', (state: boolean) => updateSubSize(state));

        // Seek to saved position
        if (startAt > 0) {
            art.on('ready', () => {
                art.currentTime = startAt;
            });
        }

        // Skip intro/outro detection
        if (intro || outro) {
            skipDismissedRef.current.clear();
            art.on('video:timeupdate', () => {
                const t = art.currentTime;
                if (
                    intro &&
                    intro.end > intro.start &&
                    t >= intro.start &&
                    t < intro.end - 1 &&
                    !skipDismissedRef.current.has('intro')
                ) {
                    setSkipButton({ label: 'Skip Intro', target: intro.end });
                } else if (
                    outro &&
                    outro.end > outro.start &&
                    t >= outro.start &&
                    t < outro.end - 1 &&
                    !skipDismissedRef.current.has('outro')
                ) {
                    setSkipButton({ label: 'Skip Outro', target: outro.end });
                } else {
                    setSkipButton(null);
                }
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

    const handleSkip = () => {
        if (!skipButton || !artRef.current) return;
        const label = skipButton.label.includes('Intro') ? 'intro' : 'outro';
        skipDismissedRef.current.add(label);
        artRef.current.currentTime = skipButton.target;
        setSkipButton(null);
    };

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="aspect-video w-full overflow-hidden rounded-lg"
            />
            {skipButton && (
                <button
                    onClick={handleSkip}
                    className="absolute bottom-16 right-4 z-10 flex items-center gap-2 rounded-lg border border-accent/50 bg-base/80 px-4 py-2 text-sm font-semibold text-accent backdrop-blur-sm transition hover:bg-accent hover:text-base"
                >
                    {skipButton.label}
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
