import { createStyles } from '@/styles';
import { IAutocompleteComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';

/**
 * Emits the Appearance styles for the autocomplete.
 *
 * antd renders a select's visible box as `.ant-select-selector`, not the root element, so
 * border/background/padding have to land there to be seen — the same "wrapper owns the appearance"
 * situation the affix wrapper creates for plain inputs. Dimensions and margin stay on the root,
 * which is the element that occupies space in the form layout.
 *
 * Only properties actually present in the model emit CSS, so anything left unconfigured keeps
 * cascading from the theme.
 */
export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IAutocompleteComponentProps) => {
  const textAlign = model.font?.align;

  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const autocomplete = cx('sha-autocomplete-field', css`
      ${dimensionsStyles(model.dimensions)}
      ${marginStyles(model.stylingBoxJson)}

      &.${prefixCls}-select .${prefixCls}-select-selector {
        height: 100%;
        ${configuredAppearance}
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font)}
      }

      /* The search input, the rendered selection and the placeholder each carry their own font
         rules, so the configured font has to be restated on all three or the box resizes without
         its text following. */
      .${prefixCls}-select-selection-search-input,
      .${prefixCls}-select-selection-item,
      .${prefixCls}-select-selection-placeholder {
        ${fontStyles(model.font)}
      }

      .${prefixCls}-select-selection-item {
        display: flex;
        align-items: center;
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
      }

      /* antd repaints the selector background and border on hover, focus, while the dropdown is
         open and on the validation statuses. Re-assert the configured appearance at higher
         specificity so those states only change what the user did not configure. */
      &&&&.${prefixCls}-select:hover .${prefixCls}-select-selector,
      &&&&.${prefixCls}-select-focused .${prefixCls}-select-selector,
      &&&&.${prefixCls}-select-open .${prefixCls}-select-selector,
      &&&&[class*='-status-error'] .${prefixCls}-select-selector,
      &&&&[class*='-status-warning'] .${prefixCls}-select-selector {
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
