import { createStyles } from '@/styles';
import { IIconPickerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

/**
 * The trigger is laid out as a flex row, which makes `text-align` inert. Map the Font panel
 * alignment onto `justify-content` so the Align input keeps working. `justify` has no flex
 * equivalent for a single item and falls back to start.
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
   * The configured box goes on the glyph, not on the picker root: the root spans the whole form
   * column, so a border or background there would draw a full-width box around a small icon.
   * On the glyph it hugs the icon, which is what styling a glyph-only component should mean.
   */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
    ${paddingStyles(model.stylingBoxJson)}
    ${fontStyles(model.font)}
  `;

  const iconPickerStyles = cx('sha-icon-picker-container', css`
      ${marginStyles(model.stylingBoxJson)}
      box-sizing: border-box;

      /* Align the trigger within the form column. IconPicker nests the glyph two unstyled,
         block-level divs deep, so the alignment has to be passed down or those full-width divs
         swallow it before it reaches the icon. */
      display: flex;
      justify-content: ${justifyContentFor(model.font?.align)};

      > div,
      > div > .sha-icon-picker-selected-icon {
        display: flex;
        align-items: center;
        justify-content: inherit;
        flex: 1;
      }

      /*
       * Both states resolve to a single glyph: with a value it is a bare .anticon, without one it
       * is an .anticon inside a placeholder button whose chrome the base stylesheet already
       * strips. Styling .anticon therefore covers both, and the button needs no rule of its own.
       *
       * &&&& out-specifies the base stylesheet, which reaches the same elements two classes deep.
       */
      &&&& .${iconPrefixCls} {
        ${configuredAppearance}
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Size the placeholder button from the configured font and padding rather than the antd
         control height, so the empty state matches the selected one. */
      &&&& .ant-btn {
        height: auto;
        width: auto;
        min-width: 0;
        padding: 0;
        border: none;
      }

      /* Hold the configured box through hover and focus so it does not fall back to antd
         defaults mid-interaction. */
      &&&&:hover .${iconPrefixCls},
      &&&&:focus .${iconPrefixCls},
      &&&&:focus-within .${iconPrefixCls} {
        ${configuredAppearance}
      }
    `);

  /**
   * Disabled greys the picker out and blocks interaction; read-only leaves it at full strength
   * because the value is still being presented.
   */
  const disabled = cx('sha-icon-picker-disabled', css`
      cursor: not-allowed;
      opacity: 0.4;

      /* The trigger sets pointer-events: all on itself when not read-only, so the block has to be
         re-applied on the descendant rather than only here. */
      &&& * {
        pointer-events: none;
      }
    `);

  return {
    iconPickerStyles,
    disabled,
  };
});
