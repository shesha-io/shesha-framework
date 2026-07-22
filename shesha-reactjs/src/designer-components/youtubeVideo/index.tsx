/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography } from 'antd';
import { IToolboxComponent } from '@/interfaces';
import { YoutubeOutlined } from '@ant-design/icons';
import { useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useConfigurableActionDispatcher } from '@/providers';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { getSettings } from './settingsForm';
import { IYoutubeVideoCalculatedValues, IYoutubeVideoComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { loadYouTubeIframeApi, YTPlayer, YTPlayerEvent } from './youtubeApi';
import { useStyles } from './styles';

const { Title, Paragraph } = Typography;

// True when a configurable action is actually wired up (has a non-empty action name).
const hasAction = (action?: IConfigurableActionConfiguration): boolean =>
  action?.actionName != null && action.actionName !== '';

// A configured video id that is present and non-empty.
const hasValue = (value?: string): boolean => value != null && value !== '';

const YoutubeVideoComponent: IToolboxComponent<IYoutubeVideoComponentProps, IYoutubeVideoCalculatedValues> = {
  type: 'youtubeVideo',
  isInput: true,
  isOutput: true,
  name: 'YouTube Video',
  icon: <YoutubeOutlined />,
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles();

    const {
      videoId,
      title,
      description,
      titleLevel = 3,
      autoplay = false,
      mute = false,
      loop = false,
      startTime,
      endTime,
      responsive = true,
      showControls = true,
      fullscreen = true,
      disableKeyboard = false,
      ccLoadPolicy = false,
      ccLangPref,
      playsinline = true,
      privacyMode = false,
      customThumbnail,
      thumbnailSource,
      thumbnailUrl,
      thumbnailBase64,
      thumbnailStoredFileId,
      watchCompletionRequired = false,
      onPlay,
      onPause,
      onEnd,
      onReady,
      hidden = false,
    } = model;

    const { formMode } = calculatedModel;
    const [hasWatched, setHasWatched] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const playerRef = useRef<HTMLIFrameElement>(null);
    const onChangeRef = useRef<((value: boolean | undefined | null) => void) | null>(null);

    const { executeAction } = useConfigurableActionDispatcher();
    const allConstants = useAvailableConstantsData();
    // Keep the latest evaluation context in a ref so the player callbacks never read stale form data.
    const constantsRef = useRef(allConstants);
    constantsRef.current = allConstants;

    // The Player API is needed only when events are wired up or watch-completion gates submission.
    const eventsConfigured = hasAction(onPlay) || hasAction(onPause) || hasAction(onEnd) || hasAction(onReady);
    const needsJsApi = eventsConfigured || watchCompletionRequired;

    // titleLevel arrives from the dropdown as a string ('1'..'5'); Ant's Title needs a 1-5 number.
    const parsedTitleLevel = Number(titleLevel);
    const resolvedTitleLevel = (Number.isFinite(parsedTitleLevel) && parsedTitleLevel >= 1 && parsedTitleLevel <= 5
      ? parsedTitleLevel
      : 3) as 1 | 2 | 3 | 4 | 5;

    // Resolve thumbnail URL based on source type
    const getThumbnailUrl = (): string | null => {
      // Backward compatibility: use old customThumbnail if new properties not set
      if (thumbnailSource == null && hasValue(customThumbnail)) {
        return customThumbnail ?? null;
      }

      switch (thumbnailSource) {
        case 'url':
          return thumbnailUrl ?? null;
        case 'base64':
          return thumbnailBase64 ?? null;
        case 'storedFile':
          return thumbnailStoredFileId != null && thumbnailStoredFileId !== ''
            ? `/api/StoredFile/Download?id=${encodeURIComponent(thumbnailStoredFileId)}`
            : null;
        default:
          return null;
      }
    };

    const resolvedThumbnail = getThumbnailUrl();

    // Helper to convert any value to percentage
    const toPercentage = (value: string | number | undefined): string | undefined => {
      if (value === undefined) {
        return undefined;
      }

      const strValue = String(value).trim();

      // If already a percentage, return as-is
      if (strValue.endsWith('%')) {
        return strValue;
      }

      // Extract numeric part from "500px", "500", etc.
      const numericPart = strValue.match(/^(\d+(?:\.\d+)?)/)?.[1];
      if (numericPart == null) {
        return undefined;
      }

      const numeric = parseFloat(numericPart);
      if (!Number.isFinite(numeric) || numeric < 0) {
        return undefined;
      }

      return `${numeric}%`;
    };

    // Intercept dimensions when responsive mode is enabled
    let finalDimensionStyles = { ...model.allStyles?.dimensionsStyles };

    if (responsive && model.dimensions != null) {
      // Convert configured width to a percentage for the 16:9 responsive container
      finalDimensionStyles = {
        ...finalDimensionStyles,
        width: toPercentage(model.dimensions.width) ?? '100%',
        height: undefined, // Remove height for aspect ratio
      };
    } else if (!responsive) {
      if (finalDimensionStyles.width === undefined && finalDimensionStyles.height === undefined) {
        finalDimensionStyles = {
          ...finalDimensionStyles,
          width: 560,
          height: 315,
        };
      };
    }

    // Apply all styles to component wrapper
    const componentStyles = removeUndefinedProps({
      ...model.allStyles?.jsStyle,
      ...finalDimensionStyles, // Use intercepted dimensions
      ...model.allStyles?.borderStyles,
      ...model.allStyles?.shadowStyles,
      ...model.allStyles?.stylingBoxAsCSS,
    });

    // Build YouTube URL with parameters
    const buildYoutubeUrl = (): string | null => {
      if (!hasValue(videoId)) {
        // Nothing to embed (placeholder is shown in designer mode)
        return null;
      }

      const domain = privacyMode ? 'youtube-nocookie.com' : 'youtube.com';
      const baseUrl = `https://www.${domain}/embed/${videoId}`;

      const params = new URLSearchParams();

      // Playback parameters
      if (autoplay) params.append('autoplay', '1');
      if (mute) params.append('mute', '1');
      if (loop) {
        params.append('loop', '1');
        params.append('playlist', videoId ?? '');
      }
      if (startTime != null) params.append('start', startTime.toString());
      if (endTime != null) params.append('end', endTime.toString());

      // Control parameters
      if (!showControls) params.append('controls', '0');
      if (!fullscreen) params.append('fs', '0');
      if (disableKeyboard) params.append('disablekb', '1');

      // Caption parameters
      if (ccLoadPolicy) params.append('cc_load_policy', '1');
      if (hasValue(ccLangPref)) params.append('cc_lang_pref', ccLangPref ?? '');

      // Mobile parameters
      if (!playsinline) params.append('playsinline', '0');

      // JS API and security - enable when events are wired or watch completion is required
      if (needsJsApi) {
        params.append('enablejsapi', '1');
        // Add origin parameter for security when using JS API
        if (typeof window !== 'undefined') {
          params.append('origin', window.location.origin);
        }
      }

      return `${baseUrl}?${params.toString()}`;
    };

    const youtubeUrl = buildYoutubeUrl();

    // Memoize style objects to avoid recreating on each render
    const containerStyle: React.CSSProperties = useMemo(() => responsive
      ? {
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        overflow: 'hidden',
        width: '100%',
        height: 0,
      }
      : {
        // Non-responsive: container fills parent (dimensions are on wrapper)
        width: '100%',
        height: '100%',
      }, [responsive]);

    const iframeStyle: React.CSSProperties = useMemo(() => responsive
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
      }, [responsive]);

    const thumbnailStyle: React.CSSProperties = useMemo(() => responsive
      ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${resolvedThumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        cursor: 'pointer',
      }
      : {
        width: '100%',
        height: '100%',
        backgroundImage: `url(${resolvedThumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        cursor: 'pointer',
      }, [responsive, resolvedThumbnail]);

    // The iframe is only in the DOM once shown (a thumbnail hides it until the viewer clicks).
    const iframeShown = resolvedThumbnail == null || hasWatched;

    // Keep the latest handlers/context in a ref so the player isn't recreated when they change.
    const handlersRef = useRef({ onPlay, onPause, onEnd, onReady, executeAction });
    handlersRef.current = { onPlay, onPause, onEnd, onReady, executeAction };

    // Track play/pause/end via the official YouTube IFrame Player API (reliable, unlike raw postMessage).
    useEffect(() => {
      if (!needsJsApi || formMode === 'designer' || !hasValue(videoId) || !iframeShown) {
        return undefined;
      }

      let player: YTPlayer | null = null;
      let cancelled = false;

      const fire = (action?: IConfigurableActionConfiguration): void => {
        if (!hasAction(action)) return;
        void handlersRef.current.executeAction({
          actionConfiguration: action as IConfigurableActionConfiguration,
          argumentsEvaluationContext: constantsRef.current,
        });
      };

      loadYouTubeIframeApi()
        .then((YT) => {
          if (cancelled || playerRef.current == null) return;
          player = new YT.Player(playerRef.current, {
            events: {
              onReady: (): void => fire(handlersRef.current.onReady),
              onStateChange: (event: YTPlayerEvent): void => {
                if (event.data === YT.PlayerState.PLAYING) {
                  setHasWatched(true);
                  fire(handlersRef.current.onPlay);
                } else if (event.data === YT.PlayerState.PAUSED) {
                  fire(handlersRef.current.onPause);
                } else if (event.data === YT.PlayerState.ENDED) {
                  setHasWatched(true);
                  setIsCompleted(true);
                  onChangeRef.current?.(true);
                  fire(handlersRef.current.onEnd);
                }
              },
            },
          });
        })
        .catch(() => {
          // API blocked (e.g. sandboxed browser); the embed still plays, tracking just won't fire.
        });

      return () => {
        cancelled = true;
        try {
          player?.destroy();
        } catch {
          // player may already be gone
        }
      };
    }, [needsJsApi, formMode, videoId, iframeShown]);

    if (hidden) {
      return null;
    }

    // Add custom validation when watch completion is required
    const modelWithValidation = watchCompletionRequired
      ? {
        ...model,
        validate: {
          ...model.validate,
          validator: `
              // Custom validator for watch completion
              if (value === true) {
                return Promise.resolve();
              }
               return Promise.reject(new Error('You must watch the entire video to continue'));
            `,
        },
      }
      : model;

    return (
      <ConfigurableFormItem model={modelWithValidation}>
        {(value: boolean | undefined | null, onChange: (newValue: boolean | undefined | null) => void) => {
          // Store onChange in ref for event handler
          onChangeRef.current = onChange;

          // Check completion from both state and form value
          const completed = value === true || isCompleted;

          // Render placeholder in designer mode
          if (formMode === 'designer' && !hasValue(videoId)) {
            return (
              <div className={styles.youtubeVideoPlaceholder}>
                <YoutubeOutlined style={{ fontSize: '48px', color: '#ff0000' }} />
                <p>YouTube Video Component</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  Configure the Video ID in settings to see the video
                </p>
              </div>
            );
          }

          return (
            <div className={styles.youtubeVideoComponent} style={componentStyles}>
              {hasValue(title) && (
                <Title
                  level={resolvedTitleLevel}
                  className="youtube-video-title"
                >
                  {title}
                </Title>
              )}
              {hasValue(description) && (
                <Paragraph
                  className="youtube-video-description"
                >
                  {description}
                </Paragraph>
              )}

              <div className="youtube-video-container" style={containerStyle}>
                {resolvedThumbnail != null && !hasWatched ? (
                  <div
                    className="youtube-custom-thumbnail"
                    role="button"
                    tabIndex={0}
                    aria-label={hasValue(title) ? `Play video: ${title ?? ''}` : 'Play video'}
                    onClick={() => setHasWatched(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setHasWatched(true);
                      }
                    }}
                    style={thumbnailStyle}
                  >
                    <div className="youtube-play-button">
                      <YoutubeOutlined style={{ fontSize: '64px', color: 'white' }} />
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={playerRef}
                    src={youtubeUrl ?? ''}
                    style={iframeStyle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={hasValue(title) ? title : 'YouTube Video'}
                  />
                )}
              </div>

              {watchCompletionRequired && !completed && formMode !== 'designer' && (
                <div className="youtube-completion-warning">
                  <span style={{ color: 'orange' }}>⚠️ You must watch the entire video to continue</span>
                </div>
              )}
            </div>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  calculateModel: (_model, allData) => ({
    formMode: allData.form?.formMode ?? 'readonly',
  }),
  initModel: (model) => {
    const baseModel = {
      responsive: true,
      showControls: true,
      fullscreen: true,
      disableKeyboard: false,
      ccLoadPolicy: false,
      playsinline: true,
      hideLabel: true, // Hide label by default for video component
      ...model,
    };

    return baseModel;
  },

  migrator: (m) => m
    .add<IYoutubeVideoComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as IYoutubeVideoComponentProps))
    .add<IYoutubeVideoComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IYoutubeVideoComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default YoutubeVideoComponent;
