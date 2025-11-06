import { FormMode, IConfigurableFormComponent } from '@/providers/form/models';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';

export interface IYoutubeVideoComponentProps extends IConfigurableFormComponent {
  // Basic Configuration
  videoId: string;
  title?: string;
  description?: string;

  // Typography Configuration
  titleLevel?: 1 | 2 | 3 | 4 | 5;

  // Playback Settings
  autoplay?: boolean;
  startTime?: number;
  endTime?: number;
  loop?: boolean;

  // Display Options
  width?: string | number; // Deprecated: kept for backward compatibility, use Appearance tab dimensions instead
  height?: string | number; // Deprecated: kept for backward compatibility, use Appearance tab dimensions instead
  responsive?: boolean;
  dimensions?: {
    width: number | string;
    height: number | string;
  };

  // Player Controls
  showControls?: boolean;
  mute?: boolean;
  fullscreen?: boolean;
  disableKeyboard?: boolean;

  // Caption Settings
  ccLoadPolicy?: boolean;
  ccLangPref?: string;

  // Mobile Settings
  playsinline?: boolean;

  // Form-Specific Behavior (Lower Priority)
  isRequired?: boolean;
  watchCompletionRequired?: boolean;

  // Event Handlers
  onPlay?: IConfigurableActionConfiguration;
  onPause?: IConfigurableActionConfiguration;
  onEnd?: IConfigurableActionConfiguration;
  onReady?: IConfigurableActionConfiguration;

  // Advanced Settings (Lower Priority)
  customThumbnail?: string; // Deprecated - use thumbnailUrl instead
  thumbnailSource?: 'url' | 'storedFile' | 'base64';
  thumbnailUrl?: string;
  thumbnailBase64?: string;
  thumbnailStoredFileId?: string;
  privacyMode?: boolean;
}

export interface IYoutubeVideoCalculatedValues {
  formMode: FormMode;
}

export interface IYouTubeEventData {
  event: string;
  info?: number;
}
