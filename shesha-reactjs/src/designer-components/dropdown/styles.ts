import { createStyles } from '@/styles';
import { IDropdownComponentProps } from './model';
import { backgroundStyles, borderRadiusStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles, splitBackgroundProperties } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { CSSProperties } from 'react';
import { PresetColors } from 'antd/es/theme/interface';

/**
 * The colour classes antd may put on a tag (`ant-tag-red`, `ant-tag-success`, …), sourced from
 * antd itself so the list cannot drift. Status colours are not in `PresetColors` but produce the
 * same kind of class, and `-inverse` variants render through the base colour class.
 */
const TAG_COLOUR_CLASSES: readonly string[] = [
  ...PresetColors,
  'success', 'processing', 'error', 'default', 'warning',
];

/**
 * Emits the two Appearance style sets.
 *
 * The bare-named model properties style the select control itself (antd renders the visible box as
 * `.ant-select-selector`, not the root element, so border/background/dimensions have to land there
 * to be seen). The `tag` set is scoped to each `.ant-tag` descendant, which is what makes it apply
 * per selected item rather than to the whole control — the same descendant-scoping the checkbox
 * group uses for its repeated child.
 *
 * Only properties actually present in the model emit CSS, so anything left unconfigured keeps
 * cascading from the theme.
 */
export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IDropdownComponentProps & { tagStyleJson?: CSSProperties | undefined }) => {
  const tag = model.tag;
  const textAlign = model.font?.align;
  const tagTextAlign = tag?.font?.align;
  // The nested Custom style is evaluated by the Factory and applied last so it beats the panel
  // inputs. Its background half is routed to the colour selector below rather than the base rule,
  // so it respects the same per-option-colour exclusion the Background panel does.
  const tagCustomStyle = splitBackgroundProperties(model.tagStyleJson);

  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;
  // Built outside the template: the attribute selectors need quotes, which would terminate the
  // tagged template literal if written inline.
  //
  // Excludes only the *colour* classes antd emits for an option that carries one. It cannot be
  // written as a single `[class*='${prefixCls}-tag-']`: antd always adds a variant class
  // (`-solid`/`-filled`/`-outlined`) to every tag, so that broader form matches every tag and the
  // configured background is never applied — leaving colourless tags on antd's own solid default.
  const tagColourSelector = `.${prefixCls}-tag${TAG_COLOUR_CLASSES
    .map((colour) => `:not(.${prefixCls}-tag-${colour})`)
    .join('')}`;

  /* Filled and Outlined are borderless variants, so the configured Border is not emitted for them
     and any border antd would otherwise draw is removed below. Solid keeps the configured border. */
  const tagVariant = model.tagVariant ?? 'solid';
  const hidesBorder = tagVariant === 'filled' || tagVariant === 'outlined';
  const configuredTagBorder = hidesBorder ? '' : borderStyles(tag?.border);

  const dropdown = cx('sha-dropdown', css`
      ${dimensionsStyles(model.dimensions)}
      ${marginStyles(model.stylingBoxJson)}
      height: 100%;
      ${isDefined(model.dimensions?.height) && model.dimensions.height !== 'auto' ? 'overflow-y: auto;' : ''}
      ${configuredAppearance}

      /* The visible box is the selector element, not the root. A rule scoped to select-content
         matches nothing: that is a semantic classNames slot, emitted only when a caller passes
         classNames.content, which this component never does. */
      &.${prefixCls}-select .${prefixCls}-select-selector {
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font)}

        .${prefixCls}-select-selection-overflow {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
          ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
        }

        scrollbar-width: thin;
        ::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }
      }

      /* The search input and the rendered selection both need the wrapper font. */
      .${prefixCls}-select-selection-search-input,
      .${prefixCls}-select-selection-item,
      .${prefixCls}-select-selection-placeholder {
        ${fontStyles(model.font)}
      }

      .${prefixCls}-select-selection-item {
        --ant-line-width: 0px !important;
        line-height: unset !important;
        overflow: visible;
        height: 100%;
        display: flex;
        align-items: center;
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}

        .${prefixCls}-select-selection-item-content {
          display: flex;
          overflow: visible;
        }

        &:hover {
          border: none !important;
        }
      }
     
      .${prefixCls}-select-content {
      }
      &&&& .${prefixCls}-tag {
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        cursor: default;
        ${isDefined(tagTextAlign) ? `justify-content: ${tagTextAlign};` : ''}
        ${borderRadiusStyles(tag?.border)}
        ${shadowStyles(tag?.shadow)}
        ${dimensionsStyles(tag?.dimensions)}
        ${paddingStyles(tag?.stylingBoxJson)}
        ${fontStyles(tag?.font)}
        ${marginStyles(tag?.stylingBoxJson)}
        ${cssPropertiesToString(tagCustomStyle.rest)}

        /* The label and icon inside the tag carry their own font rules, so the configured font has
           to be restated here or the tag box resizes without its text following. */
        .anticon,
        span {
          ${fontStyles(tag?.font)}
        }
      }

      /* Colour and border apply only to tags with no option colour of their own. An option that
         carries a colour renders through an antd preset class, and its Variant (solid, outlined or
         filled) is what decides how that colour is painted — the configured background must not
         overwrite it. */
      &&&& ${tagColourSelector} {
        ${configuredTagBorder}
        ${backgroundStyles(tag?.background)}
        ${cssPropertiesToString(tagCustomStyle.background)}
      }

      /* Filled and Outlined are borderless by intent, so the tag shows no border regardless of the
         option colour. (For a colour-carrying tag antd sets its own borderColor on outlined and
         solid but none on filled, so without this the base border would leak through on filled.) */
      ${hidesBorder ? `
      &&&& .${prefixCls}-tag {
        border: none;
      }` : ''}


      &.${prefixCls}-select-open,
      &:hover {
        border-color: ${token.colorPrimary} !important;
      }

      /* Re-assert the configured appearance in every state antd repaints (see above). */
      &&&&.${prefixCls}-select:hover .${prefixCls}-select-selector,
      &&&&.${prefixCls}-select-focused .${prefixCls}-select-selector,
      &&&&.${prefixCls}-select-open .${prefixCls}-select-selector,
      &&&&[class*='-status-error'] .${prefixCls}-select-selector,
      &&&&[class*='-status-warning'] .${prefixCls}-select-selector {
        ${configuredAppearance}
      }
    `);

  return {
    dropdown,
  };
});
