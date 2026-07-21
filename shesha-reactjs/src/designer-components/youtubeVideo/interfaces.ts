import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IYoutubeVideoComponentProps extends IConfigurableFormComponent {
  // Basic Configuration
  videoId: string;
  title?: string;
  description?: string;

  // Playback Settings
  autoplay?: boolean;
  startTime?: number;
  endTime?: number;
  loop?: boolean;

  // Display Options
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
  className?: string;
  style?: string;
  stylingBox?: string;

  // Player Controls
  showControls?: boolean;
  mute?: boolean;
  modestBranding?: boolean;
  rel?: boolean;

  // Form-Specific Behavior
  isRequired?: boolean;
  watchCompletionRequired?: boolean;
  interactionEvents?: boolean;

  // Optional JS handlers run on player events (require interactionEvents).
  // Each receives `event`, `data` (form data) and `globalState` in scope.
  onPlay?: string;
  onPause?: string;
  onEnd?: string;

  // Advanced Settings
  customThumbnail?: string;
  privacyMode?: boolean;
}
