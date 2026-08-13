import { createStyles } from '@/styles';
import { IIconPickerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

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
  // The box model (border, background, dimensions, shadow, spacing) belongs to the container the
  // icon sits in; Font drives the glyph itself.
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const iconPickerStyles = cx('sha-icon-picker-container', css`
      ${configuredAppearance}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}
      ${marginStyles(model.stylingBoxJson)}

      box-sizing: border-box;

      /* The picker renders either the chosen glyph or a "select icon" button. Centre whichever it
         is on the cross axis so a configured height does not leave it pinned to the top, and use
         justify-content for the Font panel horizontal alignment (see justifyContentFor). */
      display: flex;
      align-items: center;
      justify-content: ${justifyContentFor(model.font?.align)};

      /* Honour the configured appearance while the user hovers or focuses the trigger, so the
         box does not flash back to the antd defaults mid-interaction. */
      &&&&:hover,
      &&&&:focus,
      &&&&:focus-within {
        ${configuredAppearance}
      }

      /* The glyph inherits colour and size from the container font styles. The antd icon sets its
         own font-size, so it has to be restated here rather than left to inherit. */
      .${iconPrefixCls} {
        ${fontStyles(model.font)}
      }

      /* The placeholder button is chrome, not content: keep it transparent so the configured
         container background is what shows through, in every antd button state. */
      .ant-btn,
      .ant-btn:hover,
      .ant-btn:focus {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
        color: inherit;
      }
    `);

  /**
   * Disabled state. Read-only renders the icon at full strength (the value is still being
   * presented); disabled greys it out and blocks pointer interaction, matching how antd disables
   * its own inputs. `IconPicker` renders no focusable element once selection is blocked, so
   * removing it from the tab order needs nothing beyond that.
   */
  const disabled = cx('sha-icon-picker-disabled', css`
      cursor: not-allowed;
      opacity: 0.4;

      /* The trigger sets pointer-events: all on itself when not read-only, so the block has to be
         re-applied on the descendant rather than only on this container. */
      &&& * {
        pointer-events: none;
      }
    `);

  return {
    iconPickerStyles,
    disabled,
  };
});
