import React, { useState, useEffect, useRef, FC, ReactNode } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { YoutubeOutlined } from '@ant-design/icons';
import { getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData, useGlobalState } from '@/providers';
import { useForm } from '@/providers/form';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { executeFunction } from '@/utils';
import { getSettings } from './settingsForm';
import { IYoutubeVideoComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { loadYouTubeIframeApi, YTPlayer } from './youtubeApi';
import classNames from 'classnames';
import { useStyles } from './styles';

// Convert a width/height setting (number, numeric string, or a CSS size like "100%") to a valid CSS size.
const toCssSize = (value: string | number | undefined, fallback: number): string => {
  if (value === undefined || value === null || value === '') return `${fallback}px`;
  return typeof value === 'number' || /^\d+$/.test(String(value)) ? `${value}px` : String(value);
};

// Accept a bare 11-char video ID or any common YouTube URL (watch?v=, youtu.be/, embed/, shorts/, live/)
// and return just the video ID. Pasting a full URL into the Video ID field is the usual cause of the
// generic "An error occurred" embed failure, so we normalise it here.
const extractVideoId = (input: string): string => {
  const value = (input || '').trim();
  if (!value) return '';
  // Already a bare ID (YouTube IDs are 11 chars: letters, digits, - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/ID
    /\/live\/([a-zA-Z0-9_-]{11})/, // /live/ID
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(value);
    if (match) return match[1];
  }
  // Unrecognised input: return empty so buildYoutubeUrl yields null and we render nothing,
  // rather than embedding a malformed /embed/<garbage> URL (the failure this helper prevents).
  return '';
};

// Pushes the "watched/completed" boolean into the form value so Shesha's required-validation
// can block submission until the gate is satisfied. Rendered inside ConfigurableFormItem.
const GateValueSync: FC<{ satisfied: boolean; value: unknown; onChange?: (v: unknown) => void; children: ReactNode }> = ({
  satisfied,
  value,
  onChange,
  children,
}) => {
  useEffect(() => {
    // onChange is only supplied by Form.Item when a Property Name is bound; guard so a
    // missing binding can never crash the component.
    if (typeof onChange !== 'function') return;
    // Only ever push the gate forward. Never write `undefined`, otherwise reopening a saved
    // record (where the value was persisted `true`) would be clobbered on mount — before local
    // playback state has caught up — forcing the user to re-watch every time.
    if (satisfied && value !== true) onChange(true);
  }, [satisfied, value, onChange]);
  return <>{children}</>;
};

const YoutubeVideoComponent: IToolboxComponent<IYoutubeVideoComponentProps> = {
  type: 'youtubeVideo',
  isInput: false,
  name: 'YouTube Video',
  icon: <YoutubeOutlined />,
  Factory: ({ model }) => {
    const {
      videoId,
      title,
      description,
      autoplay = false,
      mute = false,
      loop = false,
      startTime,
      endTime,
      width = 560,
      height = 315,
      responsive = true,
      showControls = true,
      rel = false,
      modestBranding = false,
      privacyMode = false,
      customThumbnail,
      isRequired = false,
      watchCompletionRequired = false,
      interactionEvents = false,
      onPlay,
      onPause,
      onEnd,
      hidden = false,
    } = model;

    const { formMode } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { styles } = useStyles();
    const [hasWatched, setHasWatched] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Normalise the configured value to a bare video ID (empty when it is missing or malformed).
    const resolvedVideoId = extractVideoId(videoId);

    // The Player API is only needed when we track events or gate submission.
    const needsPlayerApi = interactionEvents || isRequired || watchCompletionRequired;
    const iframeId = `youtube-player-${model.id}`;

    // Keep the latest handler context in a ref so the player's onStateChange never
    // reads stale form data and the player isn't recreated when data changes.
    const handlersRef = useRef({ onPlay, onPause, onEnd, data, globalState });
    handlersRef.current = { onPlay, onPause, onEnd, data, globalState };

    // Apply custom style (code) + margin/padding (styling box). Sizing is handled
    // separately via width/height/responsive to keep a single source of truth.
    const finalStyles = getLayoutStyle(model, { data, globalState });

    // Build YouTube URL with parameters. Returns null when there is no video to embed.
    const buildYoutubeUrl = (): string | null => {
      const id = resolvedVideoId;
      if (!id) return null;

      const domain = privacyMode ? 'youtube-nocookie.com' : 'youtube.com';
      const baseUrl = `https://www.${domain}/embed/${id}`;

      const params = new URLSearchParams();

      // Autoplay either when configured, or when the viewer clicked the custom thumbnail to start.
      const shouldAutoplay = autoplay || (Boolean(customThumbnail) && hasWatched);

      if (shouldAutoplay) params.append('autoplay', '1');
      if (mute) params.append('mute', '1');
      if (loop) {
        params.append('loop', '1');
        params.append('playlist', id);
      }
      if (startTime) params.append('start', startTime.toString());
      if (endTime) params.append('end', endTime.toString());
      if (!showControls) params.append('controls', '0');
      if (!rel) params.append('rel', '0');
      if (modestBranding) params.append('modestbranding', '1');
      if (needsPlayerApi) {
        params.append('enablejsapi', '1');
        if (typeof window !== 'undefined' && window.location?.origin) {
          params.append('origin', window.location.origin);
        }
      }

      const query = params.toString();
      return query ? `${baseUrl}?${query}` : baseUrl;
    };

    const youtubeUrl = buildYoutubeUrl();

    // The iframe is only in the DOM once it is actually shown (a custom thumbnail hides it until clicked).
    const iframeRendered = !customThumbnail || hasWatched;

    // Attach the YouTube IFrame Player API to track play/pause/end for event handlers and gating.
    useEffect(() => {
      if (!needsPlayerApi || formMode === 'designer' || !youtubeUrl || !iframeRendered) return undefined;

      let player: YTPlayer | null = null;
      let cancelled = false;

      loadYouTubeIframeApi()
        .then((YT) => {
          if (cancelled || !document.getElementById(iframeId)) return;
          player = new YT.Player(iframeId, {
            events: {
              onStateChange: (e: { data: number }) => {
                const { onPlay: play, onPause: pause, onEnd: end, data: d, globalState: gs } = handlersRef.current;
                if (e.data === YT.PlayerState.PLAYING) {
                  setHasWatched(true);
                  if (play) executeFunction(play, { event: e, data: d, globalState: gs });
                } else if (e.data === YT.PlayerState.PAUSED) {
                  if (pause) executeFunction(pause, { event: e, data: d, globalState: gs });
                } else if (e.data === YT.PlayerState.ENDED) {
                  setHasWatched(true);
                  setIsCompleted(true);
                  if (end) executeFunction(end, { event: e, data: d, globalState: gs });
                }
              },
            },
          });
        })
        .catch(() => {
          // API blocked (e.g. a sandboxed browser); the embed still plays, tracking simply won't fire.
        });

      return () => {
        cancelled = true;
        try {
          player?.destroy();
        } catch {
          // player may already be gone
        }
      };
    }, [needsPlayerApi, formMode, youtubeUrl, iframeRendered, iframeId]);

    if (hidden) return null;

    // Render placeholder in designer mode when no valid video is configured yet
    if (formMode === 'designer' && !resolvedVideoId) {
      return (
        <div className={styles.youtubeVideoPlaceholder}>
          <YoutubeOutlined style={{ fontSize: '48px', color: '#ff0000' }} />
          <p>YouTube Video Component</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Configure a valid Video ID in settings to see the video
          </p>
        </div>
      );
    }

    // At runtime, render nothing when no valid video is configured (avoids a broken/fallback embed)
    if (!resolvedVideoId) return null;

    const containerStyle: React.CSSProperties = responsive
      ? {
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        maxWidth: '100%',
      }
      : {
        width: toCssSize(width, 560),
        height: toCssSize(height, 315),
      };

    const iframeStyle: React.CSSProperties = responsive
      ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }
      : {
        width: '100%',
        height: '100%',
      };

    // Gating: "required" is satisfied once playback starts; "watch completion" requires the video to end.
    const gateActive = Boolean(isRequired || watchCompletionRequired);
    const gateSatisfied = watchCompletionRequired ? isCompleted : hasWatched;

    const videoContent = (
      <div className={classNames(styles.youtubeVideoComponent, model.className)} style={finalStyles}>
        {title && <h3 className={styles.youtubeVideoTitle}>{title}</h3>}
        {description && <p className={styles.youtubeVideoDescription}>{description}</p>}

        <div className={styles.youtubeVideoContainer} style={containerStyle}>
          {customThumbnail && !hasWatched ? (
            <div
              className={styles.youtubeCustomThumbnail}
              role="button"
              tabIndex={0}
              aria-label={title ? `Play video: ${title}` : 'Play video'}
              onClick={() => setHasWatched(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setHasWatched(true);
                }
              }}
              style={{ backgroundImage: `url(${customThumbnail})` }}
            >
              <div className={styles.youtubePlayButton}>
                <YoutubeOutlined style={{ fontSize: '64px', color: 'white' }} />
              </div>
            </div>
          ) : (
            <iframe
              id={iframeId}
              src={youtubeUrl || ''}
              style={iframeStyle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'YouTube Video'}
            />
          )}
        </div>
      </div>
    );

    // The "must watch" notice; shown only while the gate is unmet. Takes the persisted form
    // value into account so a reopened, already-watched record doesn't show a stale warning.
    const gateWarning = (
      <div className={styles.youtubeCompletionWarning}>
        <span style={{ color: 'orange' }}>
          {watchCompletionRequired
            ? '⚠️ You must watch the entire video to continue'
            : '⚠️ You must start watching the video to continue'}
        </span>
      </div>
    );

    // Gate submission by binding a boolean to the form value and letting Shesha's required-validation
    // block the form until the video has been watched/completed. Only wraps at runtime.
    if (gateActive && formMode !== 'designer') {
      return (
        <ConfigurableFormItem
          model={{ ...model, hideLabel: true, validate: { ...model.validate, required: true } }}
        >
          {(value, onChange) => (
            <GateValueSync satisfied={gateSatisfied} value={value} onChange={onChange}>
              {videoContent}
              {!(gateSatisfied || value === true) && gateWarning}
            </GateValueSync>
          )}
        </ConfigurableFormItem>
      );
    }

    return videoContent;
  },
  initModel: (model) => ({
    responsive: true,
    showControls: true,
    rel: false,
    width: 560,
    height: 315,
    ...model,
  }),
  migrator: (m) => m
    .add<IYoutubeVideoComponentProps>(0, (prev: IYoutubeVideoComponentProps) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IYoutubeVideoComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IYoutubeVideoComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default YoutubeVideoComponent;
