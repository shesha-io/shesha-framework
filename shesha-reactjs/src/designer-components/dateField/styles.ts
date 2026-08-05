import { createStyles } from '@/styles';
import { IDateFieldProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

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

  return {
    dateField,
    rangePicker,
  };
});
