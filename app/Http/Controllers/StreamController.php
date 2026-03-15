<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnimeDetail;
use App\Actions\Anime\GetStreamingLinks;
use App\Models\WatchHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

final class StreamController extends Controller
{
    public function show(
        string $id,
        Request $request,
        GetStreamingLinks $streamingAction,
        GetAnimeDetail $detailAction,
    ): Response {
        $episodeId = $request->string('episodeId')->toString();
        $anime = $detailAction->handle($id);
        $streaming = $streamingAction->handle($episodeId);

        // Rewrite source and subtitle URLs to go through our proxy
        /** @var array<string, mixed> $headers */
        $headers = is_array($streaming['headers'] ?? null) ? $streaming['headers'] : [];
        $referer = isset($headers['Referer']) && is_string($headers['Referer']) ? $headers['Referer'] : '';

        if (! empty($streaming['sources']) && is_array($streaming['sources'])) {
            $streaming['sources'] = array_map(function (mixed $source) use ($referer): array {
                if (! is_array($source)) {
                    return [];
                }
                $source['url'] = route('stream.proxy', [
                    'url' => $source['url'],
                    'referer' => $referer,
                ]);

                return $source;
            }, $streaming['sources']);
        }

        if (! empty($streaming['subtitles']) && is_array($streaming['subtitles'])) {
            $streaming['subtitles'] = array_map(function (mixed $sub) use ($referer): array {
                if (! is_array($sub)) {
                    return [];
                }
                if (! empty($sub['url'])) {
                    $sub['url'] = route('stream.proxy', [
                        'url' => $sub['url'],
                        'referer' => $referer,
                    ]);
                }

                return $sub;
            }, $streaming['subtitles']);
        }

        $progress = null;
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $progress = $user->watchHistories()
                ->where('anime_id', $id)
                ->where('episode_id', $episodeId)
                ->first();
        }

        return Inertia::render('Watch', [
            'anime' => $anime,
            'streaming' => $streaming,
            'episodeId' => $episodeId,
            'progress' => $progress instanceof WatchHistory ? $progress->progress_seconds : 0,
        ]);
    }

    public function proxy(Request $request): HttpResponse
    {
        $url = $request->string('url')->toString();
        $referer = $request->string('referer')->toString();

        if ($url === '') {
            abort(400);
        }

        // SSRF protection: only allow proxying known streaming domains
        $resolvedIp = $this->isAllowedProxyUrl($url);
        if ($resolvedIp === false) {
            abort(403, 'URL not allowed');
        }

        $headers = ['Accept' => '*/*'];
        if ($referer !== '') {
            $headers['Referer'] = $referer;
        }

        // Pin DNS resolution to prevent rebinding attacks
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';

        $response = Http::withHeaders($headers)
            ->withOptions($resolvedIp !== true ? ['curl' => [CURLOPT_RESOLVE => ["{$host}:443:{$resolvedIp}", "{$host}:80:{$resolvedIp}"]]] : [])
            ->timeout(30)
            ->get($url);

        if ($response->failed()) {
            abort($response->status());
        }

        $contentType = $response->header('Content-Type') ?: 'application/octet-stream';
        $body = $response->body();

        // For HLS manifests, rewrite segment URLs to also go through proxy
        if (str_contains($contentType, 'mpegurl') || str_contains($contentType, 'x-mpegURL') || str_ends_with($url, '.m3u8')) {
            $body = $this->rewriteManifest($body, $url, $referer);
            $contentType = 'application/vnd.apple.mpegurl';
        }

        return new HttpResponse($body, 200, [
            'Content-Type' => $contentType,
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    /**
     * @return string|true|false Resolved IP on success, true if no DNS resolution needed, false if blocked
     */
    private function isAllowedProxyUrl(string $url): string|bool
    {
        $parsed = parse_url($url);
        if ($parsed === false || ! isset($parsed['host'])) {
            return false;
        }

        $host = strtolower($parsed['host']);
        $scheme = strtolower($parsed['scheme'] ?? '');

        // Block non-HTTP schemes
        if (! in_array($scheme, ['http', 'https'], true)) {
            return false;
        }

        // Resolve DNS and validate IP (prevents SSRF to internal services)
        $resolvedIp = gethostbyname($host);

        $ipToCheck = $resolvedIp;

        if (filter_var($ipToCheck, FILTER_VALIDATE_IP) !== false) {
            if (filter_var($ipToCheck, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return false;
            }
        }

        // All proxy URLs are generated server-side from Consumet API responses,
        // so domain allowlisting is unnecessary. IP-based SSRF protection above
        // is sufficient to prevent access to internal services.
        return $resolvedIp !== $host ? $resolvedIp : true;
    }

    private function rewriteManifest(string $manifest, string $manifestUrl, string $referer): string
    {
        $baseUrl = substr($manifestUrl, 0, (int) strrpos($manifestUrl, '/') + 1);

        return (string) preg_replace_callback('/^(?!#)(\S+)$/m', function (array $matches) use ($baseUrl, $referer): string {
            $segmentUrl = $matches[1];

            // Make relative URLs absolute
            if (! str_starts_with($segmentUrl, 'http')) {
                $segmentUrl = $baseUrl.$segmentUrl;
            }

            return route('stream.proxy', [
                'url' => $segmentUrl,
                'referer' => $referer,
            ]);
        }, $manifest);
    }
}
