import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const slider = cx(
    'slider',
    css`
      width: 100%;
      .ant-slider-handle {
        border-color: #d9d9d9;
      }
    `,
  );

  const appearanceForm = cx(
    'sha-appearance-form',
    css`
      [data-sha-c-type="propertyRouter"] {
        > .sha-components-container-inner {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          padding: 16px 0;
          align-items: start;
        }
      }

      /*
       * Panels that nest *several* other panels/containers (e.g. FileList's "Container Styles" with its
       * Dimensions / Margin & Padding / Custom Styles sub-panels) need the full width of the preview
       * card: let them span every grid column and lay their sub-groups out in their own grid so they tile
       * horizontally instead of stacking in one column.
       *
       * The threshold is 3+ nested sub-groups — :has(> X ~ X ~ X) means "a third X exists". Panels with
       * only one or two compact sub-groups (e.g. a "Border" panel = Border Type + Radius Type) stay in a
       * normal grid cell and are NOT forced full width.
       */
      [data-sha-c-type="propertyRouter"]
        > .sha-components-container-inner
        > [data-sha-c-type="collapsiblePanel"]:has(
          .sha-components-container-inner
            > [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
        ),
      [data-sha-c-type="propertyRouter"]
        > .sha-components-container-inner
        > [data-sha-c-type="collapsiblePanel"]:has(
          .sha-components-container-inner
            > [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
        ) {
        grid-column: 1 / -1;
      }

      /*
       * The content container of a panel that holds 3+ nested panels/containers becomes a grid so the
       * sub-groups tile. Scoped to inners inside a collapsiblePanel so the top-level propertyRouter grid
       * keeps its own column sizing defined above.
       */
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
        ),
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
        ) {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        align-items: start;
      }

      /* Each nested sub-group (panel or container) in such a grid should fill its grid cell. */
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
            ~ [data-sha-c-type="container"]
        )
        > [data-sha-c-type="container"],
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
        )
        > [data-sha-c-type="collapsiblePanel"] {
        width: 100%;
      }

      /*
       * When such a grid mixes plain inputs/rows with sub-panels, the full-width inputs/rows should span
       * every column rather than sit in a single grid cell beside the panels.
       */
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
        )
        > [data-sha-c-type="settingsInputRow"],
      [data-sha-c-type="collapsiblePanel"]
        .sha-components-container-inner:has(
          > [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
            ~ [data-sha-c-type="collapsiblePanel"]
        )
        > [data-sha-c-type="settingsInput"] {
        grid-column: 1 / -1;
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

      /* Responsive grid - single column on smaller screens */
      @media (max-width: 768px) {
        > [data-sha-c-type="propertyRouter"] {
          > .sha-components-container-inner {
            grid-template-columns: 1fr;
          }
        }
      }

      /* Two columns on medium screens */
      @media (min-width: 769px) and (max-width: 1200px) {
        > [data-sha-c-type="propertyRouter"] {
          > .sha-components-container-inner {
            grid-template-columns: repeat(2, 1fr);
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
  const themeParameters = cx(
    'theme-parameters',
    css`

      &::-webkit-scrollbar {
        display: none;
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
          padding: 16px;
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
    'theme-parameters',
    css`
      font-size: 18px;
      font-weight: 700;
    `,
  );

  const previewSection = cx(
    'preview-section',
    css`
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
    `,
  );

  const themeCardSettings = cx(
    'theme-card',
    css`
      margin-bottom: 16px;
      height: 400px;
      .ant-card-head {
        background: #fafafa;
      }
    `,
  );

  const themeCardMenu = cx(
    'theme-card',
    css`
      margin-bottom: 16px;
      height: 200px;
      .ant-card-head {
        background: #fafafa;
      }
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
