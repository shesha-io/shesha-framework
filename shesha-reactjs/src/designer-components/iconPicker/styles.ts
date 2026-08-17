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

      /*
       * The two states render different elements: with a value it is a bare .anticon glyph, with
       * none it is an antd Button wrapping its own .anticon. The configured box must land on
       * exactly one element per state, so it targets the glyph only when that glyph is NOT inside
       * a button, and the button itself otherwise. Applying it to .anticon unconditionally paints
       * the box on the inner glyph *and* leaves the button drawing its own frame around it, which
       * is the nested double-box in the empty state.
       */
      /* &&&& out-specifies the base stylesheet, which styles .sha-icon-picker-selected-icon
         .ant-btn two classes deep and would otherwise reset the configured background. */
      &&&& .${iconPrefixCls}:not(.ant-btn .${iconPrefixCls}),
      &&&& .ant-btn {
        ${configuredAppearance}
        ${fontStyles(model.font)}
        box-sizing: border-box;
        /* The base stylesheet adds a right margin to every .anticon in the picker, which offsets
           the icon inside its box. The box is the alignment reference here, so drop it. */
        margin-right: 0;
        /* The button sizes itself from the antd control height; let both states be sized by the
           configured font and padding so they look identical. */
        height: auto;
        width: auto;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /*
       * Neutralise the chrome antd puts on the button per state. This deliberately does NOT reset
       * box-shadow: it shares the specificity of the rule above and comes later, so resetting the
       * shadow here would override a configured one in the empty state. The configured appearance
       * already sets background, border and shadow, so only colour needs pinning.
       */
      &&&& .ant-btn,
      &&&& .ant-btn:hover,
      &&&& .ant-btn:focus,
      &&&& .ant-btn:active {
        color: inherit;
      }

      /* The glyph inside the placeholder button is content, not a box: it inherits the font but
         must not repeat the border/background that the button now carries. */
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
