import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography } from 'antd';
import { IToolboxComponent } from '@/interfaces';
import { YoutubeOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useConfigurableActionDispatcher, useForm, useGlobalState } from '@/providers';
import { getSettings } from './settingsForm';
import { IYouTubeEventData, IYoutubeVideoCalculatedValues, IYoutubeVideoComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { useStyles } from './styles';

const { Title, Paragraph } = Typography;

const isYouTubeEventData = (data: unknown): data is IYouTubeEventData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'event' in data &&
    typeof (data as IYouTubeEventData).event === 'string'
  );
};

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
    const onChangeRef = useRef<((value: boolean) => void) | null>(null);

    const { executeAction } = useConfigurableActionDispatcher();
    const { formData } = useForm();
    const { globalState } = useGlobalState();

    // Resolve thumbnail URL based on source type
    const getThumbnailUrl = (): string | null => {
      // Backward compatibility: use old customThumbnail if new properties not set
      if (!thumbnailSource && customThumbnail) {
        return customThumbnail;
      }

      switch (thumbnailSource) {
        case 'url':
          return thumbnailUrl || null;
        case 'base64':
          return thumbnailBase64 || null;
        case 'storedFile':
          return thumbnailStoredFileId
            ? `/api/StoredFile/Download?id=${encodeURIComponent(thumbnailStoredFileId)}`
            : null;
        default:
          return null;
      }
    };

    const resolvedThumbnail = getThumbnailUrl();

    // Helper to convert any value to percentage
    const toPercentage = (value: string | number | undefined): string | undefined => {
      if (!value) return undefined;
      const strValue = String(value);
      // Extract numeric part from "500px", "500", "50%", etc.
      const match = strValue.match(/^(\d+(?:\.\d+)?)/);
      return match ? `${match[1]}%` : undefined;
    };

    // Intercept dimensions when responsive mode is enabled
    let finalDimensionStyles = { ...model.allStyles?.dimensionsStyles };

    if (responsive && model.dimensions) {
      // Access RAW values before addPx processes them
      const rawWidth = model.dimensions.width;

      // Convert to percentage
      finalDimensionStyles = {
        ...finalDimensionStyles,
        width: rawWidth ? toPercentage(rawWidth) || '100%' : '100%',
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
      if (!videoId && formMode === 'designer') {
        // Show placeholder in designer mode
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
        params.append('playlist', videoId || '');
      }
      if (startTime) params.append('start', startTime.toString());
      if (endTime) params.append('end', endTime.toString());

      // Control parameters
      if (!showControls) params.append('controls', '0');
      if (!fullscreen) params.append('fs', '0');
      if (disableKeyboard) params.append('disablekb', '1');

      // Caption parameters
      if (ccLoadPolicy) params.append('cc_load_policy', '1');
      if (ccLangPref) params.append('cc_lang_pref', ccLangPref);

      // Mobile parameters
      if (!playsinline) params.append('playsinline', '0');

      // JS API and security - enable if any event handlers are configured or watch completion is required
      const hasEventHandlers = Boolean(onPlay?.actionName || onPause?.actionName || onEnd?.actionName || onReady?.actionName);
      const needsJsApi = hasEventHandlers || watchCompletionRequired;
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

    // Handle interaction events from YouTube Player API (at top level)
    useEffect(() => {
      const hasEventHandlers = Boolean(onPlay?.actionName || onPause?.actionName || onEnd?.actionName || onReady?.actionName);
      const needsJsApi = hasEventHandlers || watchCompletionRequired;

      if (!needsJsApi || formMode === 'designer') {
        return undefined;
      }

      const handleMessage = (event: MessageEvent): void => {
        // Check origin
        if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') {
          return;
        }

        if (event.source !== playerRef.current?.contentWindow) {
          return;
        }

        // Parse event data - might be string or already parsed
        let parsedData: unknown;
        try {
          parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch {
          // Ignore malformed messages
          return;
        }

        // Validate that the data is a YouTube event using type guard
        if (!isYouTubeEventData(parsedData)) {
          return;
        }

        const data = parsedData;
        // Create evaluation context with video and form data
        const evaluationContext = {
          videoId,
          data: formData,
          globalState,
        };

        // Handle state change events
        if (data.event === 'onStateChange') {
          switch (data.info) {
            case -1: // Unstarted
              break;
            case 0: // Video ended
              setIsCompleted(true);
              if (onChangeRef.current) onChangeRef.current(true);
              setHasWatched(true);
              if (onEnd?.actionName) {
                executeAction({
                  actionConfiguration: onEnd,
                  argumentsEvaluationContext: evaluationContext,
                });
              }
              break;
            case 1: // Playing
              setHasWatched(true);
              if (onPlay?.actionName) {
                executeAction({
                  actionConfiguration: onPlay,
                  argumentsEvaluationContext: evaluationContext,
                });
              }
              break;
            case 2: // Paused
              if (onPause?.actionName) {
                executeAction({
                  actionConfiguration: onPause,
                  argumentsEvaluationContext: evaluationContext,
                });
              }
              break;
            default:
              break;
          }
        }

        // Handle ready event
        if (data.event === 'onReady') {
          if (onReady?.actionName) {
            executeAction({
              actionConfiguration: onReady,
              argumentsEvaluationContext: evaluationContext,
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [onPlay, onPause, onEnd, onReady, formMode, videoId, formData, globalState, executeAction, watchCompletionRequired]);

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
        {(value, onChange) => {
          // Store onChange in ref for event handler
          onChangeRef.current = onChange;

          // Check completion from both state and form value
          const completed = value === true || isCompleted;

          // Render placeholder in designer mode
          if (formMode === 'designer' && !videoId) {
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
              {title && (
                <Title
                  level={titleLevel}
                  className="youtube-video-title"
                >
                  {title}
                </Title>
              )}
              {description && (
                <Paragraph
                  className="youtube-video-description"
                >
                  {description}
                </Paragraph>
              )}

              <div className="youtube-video-container" style={containerStyle}>
                {resolvedThumbnail && !hasWatched ? (
                  <div
                    className="youtube-custom-thumbnail"
                    onClick={() => setHasWatched(true)}
                    style={thumbnailStyle}
                  >
                    <div className="youtube-play-button">
                      <YoutubeOutlined style={{ fontSize: '64px', color: 'white' }} />
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={playerRef}
                    src={youtubeUrl || ''}
                    style={iframeStyle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title || 'YouTube Video'}
                    onLoad={() => {
                      // Tell YouTube iframe that we're listening for events
                      if (playerRef.current?.contentWindow) {
                        // Send listening event
                        playerRef.current.contentWindow.postMessage(JSON.stringify({
                          event: 'listening',
                          id: videoId,
                          channel: 'widget',
                        }), privacyMode ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com');

                        // Subscribe to addEventListener for state changes
                        playerRef.current.contentWindow.postMessage(JSON.stringify({
                          event: 'command',
                          func: 'addEventListener',
                          args: ['onStateChange'],
                          id: videoId,
                          channel: 'widget',
                        }), privacyMode ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com');
                        playerRef.current.contentWindow.postMessage(JSON.stringify({
                          event: 'command',
                          func: 'addEventListener',
                          args: ['onReady'],
                          id: videoId,
                          channel: 'widget',
                        }), privacyMode ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com');
                      }
                    }}
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
    formMode: allData.form.formMode,
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
    .add<IYoutubeVideoComponentProps>(0, (prev: IYoutubeVideoComponentProps) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IYoutubeVideoComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IYoutubeVideoComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default YoutubeVideoComponent;
