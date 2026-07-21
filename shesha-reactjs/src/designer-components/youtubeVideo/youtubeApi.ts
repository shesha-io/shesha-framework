// Loads the YouTube IFrame Player API script once per page and resolves when window.YT is ready.
// Reference: https://developers.google.com/youtube/iframe_api_reference

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
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!apiPromise) {
    apiPromise = new Promise<YTNamespace>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const fail = (error: Error) => {
        clearTimeout(timeoutId);
        apiPromise = null; // clear the cache so a later call can retry
        reject(error);
      };

      // Chain onto any existing ready-callback so we don't clobber other consumers
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT) {
          clearTimeout(timeoutId);
          resolve(window.YT);
        }
      };

      if (!document.getElementById(API_SCRIPT_ID)) {
        const tag = document.createElement('script');
        tag.id = API_SCRIPT_ID;
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = () => fail(new Error('Failed to load the YouTube IFrame API script'));
        document.body.appendChild(tag);
      }

      // Safety net: reject if the script loads but the ready callback never fires
      // (or the script was blocked by CSP / an ad blocker without firing onerror).
      timeoutId = setTimeout(() => {
        if (!window.YT?.Player) fail(new Error('Timed out loading the YouTube IFrame API'));
      }, 15000);
    });
  }

  return apiPromise;
};
