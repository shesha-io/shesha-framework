import { createStyles } from '@/styles';
import { IIconPickerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

/**
 * The container is a flex box (so a configured height can centre the icon vertically), which makes
 * `text-align` inert. Map the Font panel's alignment onto `justify-content` instead so the Align
 * input keeps working. `justify` has no flex equivalent for a single item and falls back to start.
 */
const justifyContentFor = (align: AlignSetting | undefined): string => {
  switch (align) {
    case 'right':
    case 'end':
      return 'flex-end';
    case 'center':
      return 'center';
    default:
      return 'flex-start';
  }
};

export const useStyles = createStyles(({ css, cx, iconPrefixCls }, model: IIconPickerComponentProps) => {
  /*
   * The configured box (border, background, shadow, padding) sits on the glyph rather than on the
   * picker root. The root is a block-level flex container that spans the form column, so a border
   * or background there would draw a full-width box around a small icon. On the glyph it hugs the
   * icon, which is what "style the icon" means for a glyph-only component.
   */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
    ${paddingStyles(model.stylingBoxJson)}
  `;

  const iconPickerStyles = cx('sha-icon-picker-container', css`
      ${marginStyles(model.stylingBoxJson)}

      box-sizing: border-box;

      /* The picker renders either the chosen glyph or a "select icon" button. Centre whichever it
         is on the cross axis, and use justify-content for the Font panel horizontal alignment,
         since a flex container makes text-align inert (see justifyContentFor). */
      display: flex;
      align-items: center;
      justify-content: ${justifyContentFor(model.font?.align)};

      /* IconPicker nests the glyph two unstyled divs deep. Those are block-level and so span the
         full width, which would swallow the alignment above — make them pass the flex through so
         the alignment actually reaches the icon. */
      > div,
      > div > .sha-icon-picker-selected-icon {
        display: flex;
        align-items: center;
        justify-content: inherit;
        flex: 1;
      }

      &&&& out-specifies the base stylesheet, which styles .sha-icon-picker-selected-icon
         .ant-btn two classes deep and would otherwise reset the configured background. */
      &&&& .${iconPrefixCls}:not(.ant-btn .${iconPrefixCls}),
      &&&& .ant-btn {
        ${configuredAppearance}
        ${fontStyles(model.font)}
        box-sizing: border-box;
        
        margin-right: 0;
        height: auto;
        width: auto;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &&&& .ant-btn,
      &&&& .ant-btn:hover,
      &&&& .ant-btn:focus,
      &&&& .ant-btn:active {
        color: inherit;
      }

      &&&& .ant-btn .${iconPrefixCls} {
        font-size: inherit;
        color: inherit;
        border: none;
        background: none;
        box-shadow: none;
        padding: 0;
        margin-right: 0;
      }

      /* Keep the configured box through hover/focus so it does not flash back to antd defaults. */
      &&&&:hover .${iconPrefixCls}:not(.ant-btn .${iconPrefixCls}),
      &&&&:focus .${iconPrefixCls}:not(.ant-btn .${iconPrefixCls}),
      &&&&:focus-within .${iconPrefixCls}:not(.ant-btn .${iconPrefixCls}),
      &&&&:hover .ant-btn,
      &&&&:focus .ant-btn,
      &&&&:focus-within .ant-btn {
        ${configuredAppearance}
      }
    `);

  const disabled = cx('sha-icon-picker-disabled', css`
      cursor: not-allowed;
      opacity: 0.4;

      &&& * {
        pointer-events: none;
      }
    `);

  return {
    iconPickerStyles,
    disabled,
  };
});
