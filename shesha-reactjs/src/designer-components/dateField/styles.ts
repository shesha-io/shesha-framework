import { createStyles } from '@/styles';
import { IDateFieldProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, popupAppearanceStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: IDateFieldProps) => {
  /* The appearance the user configured. Emitted in the base state and re-asserted in every state
     where antd would otherwise repaint it. */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  /* antd sets backgroundColor: hoverBg on :hover and activeBg on :focus/:focus-within, and repaints
     with the background shorthand on the error/warning statuses (which also wipes a configured image
     or gradient). Re-assert at higher specificity so those states only affect the border. */
  const statefulAppearance = `
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }
  `;

  const dateField = cx('sha-date-field', css`
    ${configuredAppearance}
    ${paddingStyles(model.stylingBoxJson)}
    ${marginStyles(model.stylingBoxJson)}
    ${dimensionsStyles(model.dimensions)}

    ${statefulAppearance}

    .ant-picker-input > input {
      ${fontStyles(model.font)}
      background: transparent;
    }

    .ant-picker-suffix,
    .ant-picker-clear {
      color: ${model.font?.color ?? 'rgba(0, 0, 0, 0.25)'};
    }

    /* The clear button paints its own background to mask the suffix icon underneath; keep it
       transparent so a configured background shows through instead of a white square. */
    .ant-picker-clear {
      background: transparent;
    }
  `);

  /* Range pickers put the two inputs plus the active-range indicator inside the same box, so the
     appearance belongs on the outer element exactly as with the single picker. */
  const rangePicker = cx('sha-date-field-range', css`
    ${configuredAppearance}
    ${paddingStyles(model.stylingBoxJson)}
    ${marginStyles(model.stylingBoxJson)}
    ${dimensionsStyles(model.dimensions)}

    ${statefulAppearance}

    .ant-picker-input > input {
      ${fontStyles(model.font)}
      background: transparent;
    }

    .ant-picker-suffix,
    .ant-picker-clear {
      color: ${model.font?.color ?? 'rgba(0, 0, 0, 0.25)'};
    }

    .ant-picker-clear {
      background: transparent;
    }
  `);

  /* The calendar panel is portalled to the body, out of reach of the classes above, so it needs its
     own. Unlike a select popup this is a grid rather than a list: padding insets the whole panel and
     the font applies to the date cells, which antd styles individually.

     Dimensions are deliberately not applied — the panel is sized by the calendar it contains, and
     forcing the input's width or height onto it clips the grid. */
  const popup = cx('sha-date-field-popup', css`
    &&& .ant-picker-panel-container {
      ${popupAppearanceStyles(model)}
      ${paddingStyles(model.stylingBoxJson)}
    }

    /* The panel and its header/body paint their own surface, which would cover the configured
       background on the container above. */
    &&& .ant-picker-panel,
    &&& .ant-picker-header,
    &&& .ant-picker-content th,
    &&& .ant-picker-footer {
      background: transparent;
    }

    /* The header controls and the date cells carry their own colour rules, so the configured font
       has to be restated or only part of the panel follows it. The selected and today cells keep
       their themed highlight — only the text is restated.

       Alignment is dropped: antd centres every cell in the grid, and the input's alignment (right,
       say) would push each date off-centre in its box. Align describes where the text sits in the
       input, which has no meaning for a calendar cell. */
    &&& .ant-picker-header,
    &&& .ant-picker-header button,
    &&& .ant-picker-content th,
    &&& .ant-picker-cell-in-view:not(.ant-picker-cell-disabled) .ant-picker-cell-inner {
      ${fontStyles({ ...model.font, align: undefined })}
    }

    /* A disabled date takes the configured size only. Without it the cell keeps antd's default size
       while the rest of the grid follows the configured one, so the row sits visibly out of line.
       Colour, weight and family are deliberately not applied: the greyed-out text is what marks the
       date unselectable, and a configured colour would paint it as if it were available.

       The same applies to the leading and trailing days of the adjacent months, which antd greys out
       the same way (they are not in-view, so the rule above skips them). Both are matched here so
       every cell in the grid shares one size. */
    &&& .ant-picker-cell-disabled .ant-picker-cell-inner,
    &&& .ant-picker-cell:not(.ant-picker-cell-in-view) .ant-picker-cell-inner {
      ${fontStyles({ ...model.font, color: undefined })}
    }
  `);

  return {
    dateField,
    rangePicker,
    popup,
  };
});
