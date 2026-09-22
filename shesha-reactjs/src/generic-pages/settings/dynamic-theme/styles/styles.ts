import { IConfigurableTheme } from '@/providers';
import { createStyles, sheshaStyles } from '@/styles';

/* Fixed light values: the component preview mirrors the canvas, which never follows the app's
   light/dark setting. These match antd's light colorBgContainer / colorBorderSecondary / colorText. */
const CANVAS_PREVIEW_BACKGROUND = '#ffffff';
const CANVAS_PREVIEW_BORDER = '#f0f0f0';
const CANVAS_PREVIEW_TEXT = 'rgba(0, 0, 0, 0.88)';

export const useStyles = createStyles(({ css, cx }, theme?: IConfigurableTheme) => {
  const slider = cx(
    'slider',
    css`
      width: 100%;
      .ant-slider-handle {
        border-color: #d9d9d9;
      }
    `,
  );

  /**
   * The settings panels sit two container levels deep:
   * container > inner > component > container > inner. That innermost `inner` is the
   * element laid out as the grid, so the grid rule and the breakpoints below all share
   * this selector.
   *
   * Descendant (not child) combinators, because a container rendered with
   * `noDefaultStyling` omits the `.sha-components-container` wrapper.
   */
  const panelGrid =
    '> .sha-components-container .sha-components-container-inner' +
    ' .sha-component .sha-components-container .sha-components-container-inner';

  const appearanceForm = cx(
    'sha-appearance-form',
    css`
      ${panelGrid} {
        padding: 8px;
      }

      /* The grid above supplies the spacing between the grouping panels (Border, Radius,
         Background, ...), so drop antd's padding inside each one. The header and body are
         siblings under the item, so the body is addressed via the panel, not the header. */
      .ant-collapse-item > .ant-collapse-panel > .ant-collapse-body,
      .ant-collapse-item > .ant-collapse-panel > .ant-collapse-header {
        padding: 0px;
      }

      /* Adjust form items within the grid panels */
      .ant-collapse {
        .sha-components-container-inner {
          gap: 12px;
        }

        /* Better spacing for nested containers */
        .sha-container-component {
          .sha-components-container-inner {
            gap: 8px;
          }
        }
      }

      /* Two columns on medium screens */
      @media (min-width: 769px) and (max-width: 1200px) {
        ${panelGrid} {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Responsive grid - single column on smaller screens */
      @media (max-width: 768px) {
        ${panelGrid} {
          grid-template-columns: 1fr;
        }
      }
    `,
  );

  const colorCircle = cx(
    'color-circle',
    css`
      border-radius: 50%;
      .ant-color-picker-color-block {
        border-radius: 50%;
        overflow: hidden;
      }
    `,
  );

  const colorCircleContainer = cx(
    'color-circle-container',
    css`
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `,
  );
  const themeParameters = cx(
    'theme-parameters',
    css`

      &::-webkit-scrollbar {
        display: none;
      }

      /* Outer panel only - the content inside brings its own padding. Scoped with child
         combinators so the nested appearance panels keep antd's default body padding.
         (antd 6 renders item then panel then body; there is no -content element.) */
      > .ant-collapse-item > .ant-collapse-panel > .ant-collapse-body {
        padding: 0px;
      }

      .ant-card {
        .ant-card-head {
          min-height: 40px;
          padding: 0 16px;
          
          .ant-card-head-title {
            font-size: 14px;
            font-weight: 600;
          }
        }

        .ant-card-body {
          padding: 0px;
        }
      }

      .ant-form-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }

        .properties-label  {
          top: 0px !important;
        }
      }

      .ant-slider {
        margin: 8px;
        max-width: 300px;
      }
    `,
  );

  const themeHeader = cx(
    'theme-header',
    css`
      font-size: 18px;
      font-weight: 700;
    `,
  );

  /* Represents the canvas, so it must stay light regardless of the app theme - the components
     inside are rendered the way an end user will see them (see ConfigurableFormRenderer). The
     antd Card paints its own themed body background, so that is overridden too. */
  const previewSection = cx(
    'preview-section',
    css`
      padding: 16px;
      background: ${theme?.layoutBackground ?? CANVAS_PREVIEW_BACKGROUND};
      border-radius: 8px;
      border: 1px solid ${CANVAS_PREVIEW_BORDER};
      color: ${CANVAS_PREVIEW_TEXT};

      .ant-card-body {
        background: transparent;
      }
    `,
  );

  const themeCardSettings = cx(
    'theme-card',
    css`
      margin-bottom: 16px;
      height: 400px;
    `,
  );

  const themeCardMenu = cx(
    'theme-card',
    css`
      margin-bottom: 16px;
      height: 200px;
    `,
  );

  const themeColorPicker = cx(
    'theme-color-picker',
    css`
      > .ant-color-picker-color-block {
       border-radius: 50%;
      }
    `,
  );

  const themeColorSpace = cx(
    'theme-color-space',
    css`
     align-items: center;
    `,
  );
  const space = cx(
    'theme-space',
    css`
    width: 100%;
      > .ant-space-item {
        width: 100%;
      }
    `,
  );

  const contentContainer = cx(
    'theme-content-container',
    css`
      height: calc(100vh - 205px);
    `,
  );
  const contentColumn = cx(
    'theme-content-container',
    css`
      height: 100%;
      overflow-y: auto;  
      ${sheshaStyles.thinScrollbars}
    `,
  );

  return {
    themeParameters,
    themeHeader,
    previewSection,
    themeCardMenu,
    themeCardSettings,
    themeColorPicker,
    themeColorSpace,
    space,
    contentContainer,
    contentColumn,
    colorCircle,
    colorCircleContainer,
    slider,
    appearanceForm,
  };
});
