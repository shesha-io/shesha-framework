/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography } from 'antd';
import { IToolboxComponent } from '@/interfaces';
import { YoutubeOutlined } from '@ant-design/icons';
import { useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useConfigurableActionDispatcher } from '@/providers';
import { IConfigurableActionConfiguration, isNonEmptyActionConfiguration } from '@/interfaces/configurableAction';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getSettings } from './settingsForm';
import { IYoutubeVideoCalculatedValues, IYoutubeVideoComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeUndefinedProps } from '@/utils/object';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { YouTubeVideoApi } from '@/componentsApi/componentApi';
import apiCode from '../../componentsApi/componentApi.ts?raw';
import { loadYouTubeIframeApi, YTPlayer, YTPlayerEvent } from './youtubeApi';
import { useStyles } from './styles';

const { Title, Paragraph } = Typography;

const YoutubeVideoComponent: IToolboxComponent<IYoutubeVideoComponentProps, IYoutubeVideoCalculatedValues> = {
  type: 'youtubeVideo',
  isInput: false,
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
      onPlay,
      onPause,
      onEnd,
      onReady,
      hidden = false,
    } = model;

    const { formMode } = calculatedModel;
    // `hasWatched` tracks thumbnail dismissal (iframe visibility) only.
    const [hasWatched, setHasWatched] = useState(false);
    const playerRef = useRef<HTMLIFrameElement>(null);

    // Actual playback state, kept in refs so the exposed API getters always read the latest value
    // (the getters are called later, from the form's events/expressions).
    const hasStartedRef = useRef(false);
    const isCompletedRef = useRef(false);

    const { executeAction } = useConfigurableActionDispatcher();
    const allConstants = useAvailableConstantsData();
    // Keep the latest evaluation context in a ref so the player callbacks never read stale form data.
    const constantsRef = useRef(allConstants);
    constantsRef.current = allConstants;

    // Expose read-only watch state on the component's public API so the final form can gate
    // submission itself (e.g. checking `isWatchedEntirely` in an OnBeforeSubmit event) instead of
    // this component binding to a form field.
    const componentApi = useComponentApi();
    useEffect(() => {
      componentApi?.updateApi<YouTubeVideoApi>({
        id: model.id,
        componentName: model.componentName ?? '',
        level: 3,
        typeDefinition: { typeName: 'YouTubeVideoApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'isWatched', getter: () => hasStartedRef.current },
          { name: 'isWatchedEntirely', getter: () => isCompletedRef.current },
        ],
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    // titleLevel arrives from the dropdown as a number, but older configs / JS-setting bindings may
    // deliver a string ('1'..'5'); Ant's Title needs a 1-5 number. Fall back to 3 (default).
    const parsedTitleLevel = Number(titleLevel);
    const resolvedTitleLevel = (Number.isFinite(parsedTitleLevel) && parsedTitleLevel >= 1 && parsedTitleLevel <= 5
      ? parsedTitleLevel
      : 3) as 1 | 2 | 3 | 4 | 5;

    // Resolve thumbnail URL based on source type
    const getThumbnailUrl = (): string | null => {
      // Backward compatibility: use old customThumbnail if new properties not set
      if (thumbnailSource == null && !isNullOrWhiteSpace(customThumbnail)) {
        return customThumbnail;
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

    // Convert a width value (number, "500px", "50%", etc.) to a percentage string.
    const toPercentage = (value: string | number | undefined): string | undefined => {
      if (value === undefined) {
        return undefined;
      }
      const strValue = String(value).trim();
      if (strValue.endsWith('%')) {
        return strValue;
      }
      const numericPart = /^(\d+(?:\.\d+)?)/.exec(strValue)?.[1];
      if (numericPart == null) {
        return undefined;
      }
      const numeric = Number.parseFloat(numericPart);
      if (!Number.isFinite(numeric) || numeric < 0) {
        return undefined;
      }
      return `${numeric}%`;
    };

    // Resolved, device-aware dimensions come from `model.allStyles.dimensionsStyles` — NOT
    // `model.dimensions`, which is always empty because the Appearance inputs are stored per-device
    // (desktop/tablet/mobile). Responsive: a 16:9 container drives height, so height/min/max-height
    // are dropped and the width becomes a percentage. Fixed: configured width/height (default 560x315).
    const dimensionStyles = model.allStyles?.dimensionsStyles ?? {};
    const finalDimensionStyles = responsive
      ? {
        ...dimensionStyles,
        width: toPercentage(dimensionStyles.width) ?? '100%',
        height: undefined,
        minHeight: undefined,
        maxHeight: undefined,
      }
      : {
        ...dimensionStyles,
        width: dimensionStyles.width ?? 560,
        height: dimensionStyles.height ?? 315,
      };

    // Apply all styles to the component wrapper
    const componentStyles = removeUndefinedProps({
      ...model.allStyles?.jsStyle,
      ...finalDimensionStyles,
      ...model.allStyles?.borderStyles,
      ...model.allStyles?.shadowStyles,
      ...model.allStyles?.stylingBoxAsCSS,
    });

    // Build YouTube URL with parameters
    const buildYoutubeUrl = (): string | null => {
      if (isNullOrWhiteSpace(videoId)) {
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
        params.append('playlist', videoId);
      }
      if (startTime != null) params.append('start', startTime.toString());
      if (endTime != null) params.append('end', endTime.toString());

      // Control parameters
      if (!showControls) params.append('controls', '0');
      if (!fullscreen) params.append('fs', '0');
      if (disableKeyboard) params.append('disablekb', '1');

      // Caption parameters
      if (ccLoadPolicy) params.append('cc_load_policy', '1');
      if (!isNullOrWhiteSpace(ccLangPref)) params.append('cc_lang_pref', ccLangPref);

      // Mobile parameters
      if (!playsinline) params.append('playsinline', '0');

      // Always enable the JS API (with an origin for security) so play/pause/end events fire and the
      // exposed isWatched/isWatchedEntirely state stays accurate.
      params.append('enablejsapi', '1');
      if (typeof window !== 'undefined') {
        params.append('origin', window.location.origin);
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
    // Updates the watch-state refs (exposed on the API) and fires the configured events.
    useEffect(() => {
      // Reset watch state whenever the video (or its visibility) changes, so the exposed
      // isWatched/isWatchedEntirely never carry over from a previously-played video.
      hasStartedRef.current = false;
      isCompletedRef.current = false;

      if (formMode === 'designer' || isNullOrWhiteSpace(videoId) || !iframeShown) {
        return undefined;
      }

      let player: YTPlayer | null = null;
      let cancelled = false;

      const fire = (action?: IConfigurableActionConfiguration): void => {
        if (!isNonEmptyActionConfiguration(action)) return;
        void handlersRef.current.executeAction({
          actionConfiguration: action,
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
                  hasStartedRef.current = true;
                  fire(handlersRef.current.onPlay);
                } else if (event.data === YT.PlayerState.PAUSED) {
                  fire(handlersRef.current.onPause);
                } else if (event.data === YT.PlayerState.ENDED) {
                  hasStartedRef.current = true;
                  isCompletedRef.current = true;
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
    }, [formMode, videoId, iframeShown]);

    if (hidden) {
      return null;
    }

    // Render placeholder in designer mode when no video is configured yet
    if (formMode === 'designer' && isNullOrWhiteSpace(videoId)) {
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
        {!isNullOrWhiteSpace(title) && (
          <Title
            level={resolvedTitleLevel}
            className="youtube-video-title"
          >
            {title}
          </Title>
        )}
        {!isNullOrWhiteSpace(description) && (
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
              aria-label={!isNullOrWhiteSpace(title) ? `Play video: ${title}` : 'Play video'}
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
              title={!isNullOrWhiteSpace(title) ? title : 'YouTube Video'}
            />
          )}
        </div>
      </div>
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
