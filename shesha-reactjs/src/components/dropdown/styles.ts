import { createStyles } from '@/styles';
import { IDropdownComponentProps } from '@/designer-components/dropdown/model';
import { backgroundStyles, borderRadiusStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, popupAppearanceStyles, shadowStyles, splitBackgroundProperties } from '@/designer-components/_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { CSSProperties } from 'react';

/**
 * The colour classes antd may put on a tag (`ant-tag-red`, `ant-tag-success`, …).
 *
 * Declared locally rather than imported from `antd/es/theme/interface`, which is an internal path
 * with no compatibility guarantee. `@ant-design/colors` is not a substitute: its
 * `presetPrimaryColors` omits `pink` and adds `grey`, so it does not describe the tag classes antd
 * actually emits. Status colours are not preset colours but produce the same kind of class, and
 * `-inverse` variants render through the base colour class.
 */
const TAG_COLOUR_CLASSES: readonly string[] = [
  'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano',
  'geekblue', 'lime', 'gold',
  'success', 'processing', 'error', 'default', 'warning',
];

/**
 * Emits the two Appearance style sets for the dropdown.
 *
 * Lives next to `dropdown.tsx` because it targets that component's DOM: the selectors below encode
 * the antd structure this component renders, so the two have to change together. The designer
 * component consumes it — it evaluates the nested `tag.style` script, calls this hook with the full
 * component model, and hands the resulting class down as `className`. There is deliberately only one
 * such class: building a second one here would carry equal specificity and the two would fight.
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
      ${marginStyles(model.stylingBoxJson)}
      ${isDefined(model.dimensions?.height) && model.dimensions.height !== 'auto' ? 'overflow-y: auto;' : ''}
      ${configuredAppearance}
      
      &&& {
        ${dimensionsStyles(model.dimensions)}
        ${isDefined(model.dimensions?.height) ? '' : 'height: 100%;'}
      }

      /* The visible box is the selector element, not the root. A rule scoped to select-content
         matches nothing: that is a semantic classNames slot, emitted only when a caller passes
         classNames.content, which this component never does. */
      &.${prefixCls}-select .${prefixCls}-select-selector {
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font, model.styleCss)}

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
        ${fontStyles(model.font, model.styleCss)}
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

      &&&& input {
        ${fontStyles(model.font, model.styleCss)}
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

  /* The option list is portalled to the body, out of reach of the class above, so it needs its own.
     Padding insets the list inside the panel, so it belongs on the root — applied to each option
     instead it multiplies across every row and inflates the whole popup. Font is restated on the
     options because antd sets it on `.ant-select-item` itself, where a rule on the root would be
     overridden rather than inherited.

     The `tag` set is deliberately not applied here: it styles the selected items rendered inside
     the control, and the popup lists plain options rather than tags. */
  const popup = cx('sha-dropdown-popup', css`
      &&& {
        ${popupAppearanceStyles(model)}
        ${paddingStyles(model.stylingBoxJson)}
        ${cssPropertiesToString(model.styleCss)}
      }

      /* antd paints the option list on an inner wrapper, which would cover the configured
         background of the popup root. */
      &&& .${prefixCls}-select-dropdown,
      &&& .rc-virtual-list-holder,
      &&& .${prefixCls}-select-item-empty {
        background: transparent;
      }

      /* The configured Font, at the same specificity the control uses for its own text (a single
         class). Emitting it at &&& instead made the popup win arguments the input loses: the Font
         defaults are non-empty, so every option took them while the input still showed antd's, and
         the two looked like different components. */
      .${prefixCls}-select-item,
      .${prefixCls}-select-item-option-active,
      .${prefixCls}-select-item-option-selected {
        ${fontStyles(model.font, model.styleCss)}
      }

      /* The Custom style, at &&& because it must beat antd where the Font above deliberately does
         not. It cannot ride on an inline style on the popup root: antd sets colour and font on the
         option itself, so the row overrides anything inherited from an ancestor.
         This emits nothing when no Custom style is set, leaving the rule above to win or lose
         against antd on its own. */
      &&& .${prefixCls}-select-item,
      &&& .${prefixCls}-select-item-option-active,
      &&& .${prefixCls}-select-item-option-selected {
        ${fontStyles(model.font, model.styleCss)}
      }
    `);

  return {
    dropdown,
    popup,
  };
});
