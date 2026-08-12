import { createStyles } from '@/styles';
import { IAutocompleteComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';


export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IAutocompleteComponentProps) => {
  const textAlign = model.font?.align;

  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const autocomplete = cx('sha-autocomplete-field', css`
      ${marginStyles(model.stylingBoxJson)}

      /* The root is the visible box: dimensions, border, background, shadow, padding and font all
         land here (see the note above). 0-3-0 so it beats both antd's box rule (0-1-0) and its
         \`in-form-item\` width rule (0-2-0). */
      &&& {
        ${dimensionsStyles(model.dimensions)}
        ${configuredAppearance}
        ${fontStyles(model.font)}
        display: flex;
        align-items: center;
      }

      &&& .${prefixCls}-select-input {
        ${paddingStyles(model.stylingBoxJson)}
      }

      /* The inner elements carry their own font rules, so the configured font has to be restated or
         the box resizes without its text following. They must stay transparent: the root already
         paints, and a second background here would cover it.

         These are this antd version's real class names — the typed input is \`.ant-select-input\`
         (not \`input.ant-input\`) and the placeholder is \`.ant-select-placeholder\` (not
         \`.ant-select-selection-placeholder\`). \`.ant-select-selection-item\` is the tag rendered in
         multiple mode only. */
      &&& .${prefixCls}-select-content,
      &&& .${prefixCls}-select-input,
      &&& .${prefixCls}-select-placeholder,
      &&& .${prefixCls}-select-selection-item {
        ${fontStyles(model.font)}
        background: transparent;
        border: none;
      }

      &&& .${prefixCls}-select-content {
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
        align-items: center;
        height: 100%;
      }

      /* antd repaints the box on hover, focus, while the dropdown is open and on the validation
         statuses — it swaps the CSS variables the root rule reads. Re-assert the configured
         appearance in those states so they only change what the user did not configure. */
      &&&&:hover,
      &&&&.${prefixCls}-select-focused,
      &&&&.${prefixCls}-select-open,
      &&&&[class*='-status-error'],
      &&&&[class*='-status-warning'] {
        ${configuredAppearance}
      }

      /* Keep the themed focus ring when no border of its own is configured. */
      ${isDefined(model.border) ? '' : `
      &.${prefixCls}-select-open,
      &:hover {
        border-color: ${token.colorPrimary};
      }`}
    `);

  return {
    autocomplete,
  };
});
