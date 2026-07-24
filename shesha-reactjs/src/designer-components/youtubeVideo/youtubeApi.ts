/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
// Loads the YouTube IFrame Player API script once per page and resolves when window.YT is ready.
// Reference: https://developers.google.com/youtube/iframe_api_reference

export interface YTPlayerEvent {
  data: number;
  target: unknown;
}

export interface YTPlayer {
  destroy: () => void;
}

export interface YTNamespace {
  Player: new (element: string | HTMLElement, config: unknown) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SCRIPT_ID = 'youtube-iframe-api';
let apiPromise: Promise<YTNamespace> | null = null;

export const loadYouTubeIframeApi = (): Promise<YTNamespace> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API is only available in the browser'));
  }

  // Already loaded and ready
  if (window.YT?.Player !== undefined) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise === null) {
    apiPromise = new Promise<YTNamespace>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      let scriptTag: HTMLScriptElement | null = null;
      let settled = false;

      const fail = (error: Error): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        scriptTag?.remove();
        apiPromise = null; // clear the cache so a later call can retry
        reject(error);
      };

      const succeed = (yt: YTNamespace): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve(yt);
      };

      // Chain onto any existing ready-callback so we don't clobber other consumers
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = (): void => {
        previous?.();
        if (window.YT !== undefined) succeed(window.YT);
      };

      if (document.getElementById(API_SCRIPT_ID) === null) {
        const tag = document.createElement('script');
        tag.id = API_SCRIPT_ID;
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = (): void => fail(new Error('Failed to load the YouTube IFrame API script'));
        scriptTag = tag;
        document.body.appendChild(tag);
      }

      // Safety net: reject if the script loads but the ready callback never fires
      // (or the script was blocked by CSP / an ad blocker without firing onerror).
      timeoutId = setTimeout(() => {
        if (window.YT?.Player === undefined) {
          fail(new Error('Timed out loading the YouTube IFrame API'));
        }
      }, 15000);
    });
  }

  return apiPromise;
};
