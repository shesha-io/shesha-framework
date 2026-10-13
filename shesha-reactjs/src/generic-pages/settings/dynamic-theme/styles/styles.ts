import { IConfigurableTheme } from '@/providers';
import { createStyles, sheshaStyles } from '@/styles';

/* Fixed light values: the component preview mirrors the canvas, which never follows the app's
   light/dark setting. These match antd's light colorBgContainer / colorBorderSecondary / colorText. */
const CANVAS_PREVIEW_BACKGROUND = '#ffffff';
const CANVAS_PREVIEW_BORDER = '#f0f0f0';
const CANVAS_PREVIEW_TEXT = 'rgba(0, 0, 0, 0.88)';

export const useStyles = createStyles(({ css, cx }, theme?: IConfigurableTheme) => {
  const appearanceForm = cx(
    'sha-appearance-form',
    css`
      padding-top: 8px;

      /* Spacing between the grouping panels (Border, Radius, Background, ...) comes from the
         container gaps below, so drop antd's padding inside each one. The header and body are
         siblings under the item, so the body is addressed via the panel, not the header. */
      .ant-collapse-item > .ant-collapse-panel > .ant-collapse-body,
      .ant-collapse-item > .ant-collapse-panel > .ant-collapse-header {
        padding: 0px;
      }

      /* Spacing between form items within the panels */
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

  const colorCircleLabel = cx(
    'color-circle-label',
    css`
      font-size: 12px;
    `,
  );
  const themeParameters = cx(
    'theme-parameters',
    css`
      height: 100%;

      &::-webkit-scrollbar {
        display: none;
      }

      /* Card and section titles across every tab; spacing comes from the layout, not the heading. */
      h4 {
        margin: 0;
      }

      /* Outer panel only - the content inside brings its own padding. Scoped with child
         combinators so the nested appearance panels keep antd's default body padding.
         (antd 6 renders item then panel then body; there is no -content element.) */
      > .ant-collapse-item > .ant-collapse-panel > .ant-collapse-body {
        padding: 8px;
      }

      .ant-tabs-body-holder {
        padding: 8px;

        /* Carry the height down to each tab's columns so the Components tab's menu card can fill it. */
        > .ant-tabs-body {
          height: 100%;

          > .ant-tabs-content {
            height: 100%;

            > div {
              height: 100%;
              display: flex;
              flex-direction: column;
              gap: 16px;

              > .ant-row {
                height: 100%;

                > .ant-col {
                  height: 100%;
                  overflow-y: auto;
                  ${sheshaStyles.thinScrollbars}
                }
              }
            }
          }
        }
      }

      .ant-card {
        padding: 8px;

        .ant-card-head {
          min-height: 40px;
          padding: 8px;

          .ant-card-head-title {
            font-size: 14px;
            font-weight: 600;
          }
        }

        .ant-card-body {
          padding: 8px;
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

  /** Heading + description shown as the title of every theme settings card (see CardTitle). */
  const cardTitle = cx(
    'theme-card-title',
    css`
      /* Doubled to beat the panel-wide h4 { margin: 0 } reset in themeParameters. */
      && > h4 {
        margin-bottom: 4px;
      }
    `,
  );

  const description = cx(
    'theme-parameters-description',
    css`
      font-size: 12px;
      color: #999;
    `,
  );

  /** Bold label above a block of preview content (Alerts, Forms, Buttons). */
  const sectionLabel = cx(
    'theme-section-label',
    css`
      display: block;
      margin-bottom: 12px;
    `,
  );

  /** Small hint under a section heading ("Select a circle below ..."). */
  const sectionHint = cx(
    'theme-section-hint',
    css`
      display: block;
      margin-bottom: 12px;
      font-size: 12px;
    `,
  );

  const fullWidth = cx(
    'theme-full-width',
    css`
      width: 100%;
    `,
  );

  const emptyState = cx(
    'theme-empty-state',
    css`
      padding: 16px;
      text-align: center;
      color: #999;
    `,
  );
  /* Represents the canvas, so it must stay light regardless of the app theme - the components
     inside are rendered the way an end user will see them (see ConfigurableFormRenderer). The
     antd Card paints its own themed head and body, so those are overridden too. */
  const previewSection = cx(
    'preview-section',
    css`
      padding: 16px;
      background: ${theme?.layoutBackground ?? CANVAS_PREVIEW_BACKGROUND};
      border-radius: 8px;
      border: 1px solid ${CANVAS_PREVIEW_BORDER};
      color: ${CANVAS_PREVIEW_TEXT};

      .ant-card-head {
        color: ${CANVAS_PREVIEW_TEXT};
        border-bottom-color: ${CANVAS_PREVIEW_BORDER};
      }

      .ant-card-body {
        background: transparent;
      }
    `,
  );

  const themeCardSettings = cx(
    'theme-card',
    css`
      height: 450px;
      overflow-y: auto;
    `,
  );

  const themeCardMenu = cx(
    'theme-card',
    css`
      height: 200px;
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

  const contentColumn = cx(
    'theme-content-container',
    css`
      height: calc(100vh - 160px);
      overflow-y: auto;  
      ${sheshaStyles.thinScrollbars}
    `,
  );

  return {
    themeParameters,
    previewSection,
    themeCardMenu,
    themeCardSettings,
    space,
    contentColumn,
    colorCircle,
    colorCircleContainer,
    colorCircleLabel,
    appearanceForm,
    cardTitle,
    description,
    sectionLabel,
    sectionHint,
    emptyState,
    fullWidth,
  };
});
