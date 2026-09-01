import { createStyles } from '@/styles';
import { backgroundStyles, borderRadiusStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, justifyContentFor, marginStyles, paddingStyles, shadowStyles, splitBackgroundProperties } from '@/designer-components/_common/styles/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';
import { IStatusTagComponentProps } from './model';

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
 * Emits the status tag's single Appearance style set.
 *
 * Unlike the dropdown — which has two sets, one for the select box and a nested one for its tags —
 * the status tag has exactly one, and it targets the tag. The component *is* the tag, so the
 * bare-named model properties (`font`, `border`, `background`, …) are scoped onto the `.ant-tag`
 * descendant rather than applied to the wrapper, in the same way the checkbox scopes its flat set
 * onto the box element. Nothing here paints the container: a border or background on the wrapper
 * would draw an empty-looking box around the status.
 *
 * Only properties actually present in the model emit CSS, so anything left unconfigured keeps
 * cascading from the theme.
 */
export const useStyles = createStyles((
  { css, cx, token, prefixCls },
  model: IStatusTagComponentProps & { customStyle?: CSSProperties | undefined },
) => {
  const textAlign = model.font?.align;

  /* The Custom style's background half is routed to the colour selector below rather than the base
     rule, so it respects the same per-status-colour exclusion the Background panel does. */
  const customStyle = splitBackgroundProperties(model.customStyle);

  /* Both selectors are built outside the template: their quotes would terminate the tagged
     template literal if written inline. */
  const tagWrapperSelector = '[data-tag-wrapper="true"]';

  // Excludes only the *colour* classes antd emits for a status that carries one. It cannot be
  // written as a single `[class*='${prefixCls}-tag-']`: antd always adds a variant class
  // (`-solid`/`-filled`/`-outlined`) to every tag, so that broader form matches every tag and the
  // configured background is never applied — leaving colourless tags on antd's own solid default.
  const tagColourSelector = `.${prefixCls}-tag${TAG_COLOUR_CLASSES
    .map((colour) => `:not(.${prefixCls}-tag-${colour})`)
    .join('')}`;

  /* Only Filled is borderless. Outlined's border *is* the variant, so selecting it draws a line
     without the Border panel being filled in; Solid keeps whatever the panel configured. */
  const tagVariant = model.tagVariant ?? 'solid';
  const hidesBorder = tagVariant === 'filled';
  /* Written from the parts rather than through `borderStyles`, whose `border` shorthand collapses an
     unset width or style to `0px none` — so setting only a colour used to erase the line. */
  const outlinedLine = model.border?.border?.all;
  const outlinedTagBorder = `
    border-width: ${addPx(outlinedLine?.width) ?? `${token.lineWidth}px`};
    border-style: ${isNullOrWhiteSpace(outlinedLine?.style) ? 'solid' : outlinedLine.style};
    ${isNullOrWhiteSpace(outlinedLine?.color) ? '' : `border-color: ${outlinedLine.color};`}
    ${borderRadiusStyles(model.border)}
  `;
  const configuredTagBorder = hidesBorder
    ? ''
    : tagVariant === 'outlined' ? outlinedTagBorder : borderStyles(model.border);

  /* The Font colour is split out for the same reason the background is: emitted at `&&&&` it beats
     the colour each Variant paints. The rest of the font is unrelated and stays on the base rule. */
  const fontWithoutColour = fontStyles(
    isDefined(model.font) ? { ...model.font, color: undefined } : undefined,
    // The Custom style's text half rides along, minus its colour, which is handled below.
    isDefined(model.customStyle) ? { ...model.customStyle, color: undefined } : undefined,
  );
  const fontColour = !isNullOrWhiteSpace(model.font?.color)
    ? `color: ${model.font.color};`
    : !isNullOrWhiteSpace(model.customStyle?.color)
      ? `color: ${model.customStyle.color};`
      : '';

  /* "Auto" must make the tag grow to fit its own content. `dimensionsStyles` would emit
     `height: auto` literally, which on a flex tag collapses it to the line box instead of sizing to
     the label plus its padding — so each auto axis is swapped for `max-content` and only explicit
     values are passed through. Min/max and the grid spans are unaffected, so they still come from
     the shared builder. */
  const isAuto = (value: string | number | undefined): boolean =>
    !isDefined(value) || value === '' || value === 'auto';
  const { width, height, ...otherDimensions } = model.dimensions ?? {};
  const tagDimensions = `
    ${dimensionsStyles(otherDimensions)}
    ${isAuto(width) ? 'width: max-content;' : `width: ${addPx(width)};`}
    ${isAuto(height) ? 'height: max-content;' : `height: ${addPx(height)};`}
  `;

  const statusTag = cx('sha-status-tag', css`
      /* Auto height/width: the select hugs the tag it contains rather than taking the fixed antd
         control height, so "auto" in Dimensions means the tag decides the size. An explicit value
         is applied to the tag itself, below. */
      &&& {
        ${isDefined(model.dimensions?.width) && model.dimensions.width !== 'auto' ? '' : 'width: max-content;'}
        ${isDefined(model.dimensions?.height) && model.dimensions.height !== 'auto' ? '' : 'height: max-content;'}
      }

      /* The visible box is the selector element, not the root. Cleared so the select frames
         nothing — the tag is the only thing that should read as a box.

         Centring the items is what keeps the tag centred in the space the select occupies: with
         an explicit Dimensions height, or a row taller than the tag, the tag would otherwise sit at
         the top. Padding is zeroed here so only the configured Margin & Padding positions the tag —
         any left over from antd would offset it and read as mis-centred.

         Font align is deliberately NOT applied here. The Appearance settings describe the tag, so
         alignment belongs to the text inside it; setting it on this container instead slid the whole
         tag along the row, which is a different thing entirely. */
      &.${prefixCls}-select .${prefixCls}-select-selector {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        height: 100%;
        display: flex;
        align-items: center;
      }

      /* antd centres the selection by absolutely positioning it and offsetting it by half its own
         height. That relies on a line-height the tag no longer has, so the offset lands slightly
         off; a plain flex row centres it against the real height instead. */
      &&& .${prefixCls}-select-selection-wrap,
      &&& .${prefixCls}-select-selection-overflow {
        display: flex;
        align-items: center;
        height: 100%;
      }

      /* Read-only is what this component actually renders, and that path wraps the tags in a flex
         row of its own. Left alone the row stretches its tags to fill the width, so a tag with no
         explicit Dimensions width would span the whole field rather than hugging its label — and
         any alignment set here would slide the tag along the row instead of aligning its text.
         Kept at the start so the tag sits where the field begins and sizes to its own content. */
      /* The event/tooltip wrapper shrink-wraps its tag so the hover and click target is the tag,
         not the full width of the field. */
      &&& .sha-status-tag-wrapper {
        width: max-content;
        max-width: 100%;
      }

      &&&${tagWrapperSelector},
      &&& ${tagWrapperSelector} {
        justify-content: flex-start;
        align-items: center;

        /* The read-only renderer sets an inline full width on this element, which would stretch
           the wrapper above it back across the row. Overridden so it sizes to the tag. */
        width: max-content;
        max-width: 100%;
        pointer-events: none;
      }

      &&& .${prefixCls}-tag {
        pointer-events: auto;
      }

      /* In multi-select antd wraps each tag in a selection item carrying its own shaded background,
         border and padding — which reads as a light box around the tag and its close icon. The tag
         is the only thing that should be visible, so the wrapper is stripped back to a plain
         container. Its margin is left alone: that is the gap between selections. */
      &&& .${prefixCls}-select-selection-item {
        background: transparent;
        border: none;
        padding: 0;
        height: auto;
        display: flex;
        align-items: center;
        /* antd sets a line-height here to fake vertical centring for text; the tag is a flex box
           with its own height, so an inherited line-height only skews it. */
        line-height: normal;
      }

      /* The close affordance lives in that wrapper and takes its own muted colour from antd.
         Inherited instead, so it matches the tag text it belongs to. */
      &&& .${prefixCls}-select-selection-item-remove {
        color: inherit;
      }

      &&& .${prefixCls}-tag {
        /* Some antd ancestors zero --ant-line-width, and custom properties inherit — so without
           restoring it the tag border resolves to 0 and Outlined looks like Filled. */
        --ant-line-width: ${token.lineWidth}px;
        display: inline-flex;
        align-items: center;
        overflow: hidden;

        /* Status labels are always upper case, as they were before the refactor. Done in CSS rather
           than by upper-casing the text so it covers every path uniformly — the resolved statuses,
           which ReflistTag upper-cases itself, and the placeholder and mis-configuration tags this
           component renders directly, whose labels never pass through it. Nothing configurable
           conflicts: the Font panel has no text-transform input. */
        text-transform: uppercase;

        /* The label and any icon are centred within the tag, vertically always and horizontally
           unless Font align says otherwise. Resetting the line height matters: antd gives the tag
           a fixed one that no longer matches its configured height, and an inherited value
           offsets the text within the box — the usual cause of a tag whose text sits high.

           Margin is deliberately NOT zeroed here: it comes from Margin & Padding below, which is
           what shifts a tag off centre when the user asks for extra space. */
        line-height: normal;
        ${isDefined(textAlign) ? `justify-content: ${justifyContentFor(textAlign)};` : 'justify-content: center;'}

        ${borderRadiusStyles(model.border)}
        ${shadowStyles(model.shadow)}
        ${tagDimensions}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}
        ${fontWithoutColour}
        ${cssPropertiesToString(customStyle.rest)}

        /* Restated or the tag box resizes without its text following. Colour is left off so the
           label keeps inheriting whichever colour won on the tag itself, and the same
           line-height reset applies so the text is centred rather than sitting on antd's baseline. */
        .anticon,
        span {
          line-height: normal;
          ${fontWithoutColour}
        }
      }

      /* Colour and border apply only to tags with no status colour of their own. A status that
         carries a colour renders through an antd preset class, and its Variant (solid, outlined or
         filled) is what decides how that colour is painted — the configured background must not
         overwrite it. */
      &&&& ${tagColourSelector} {
        ${configuredTagBorder}
        ${fontColour}
        ${backgroundStyles(model.background)}
        ${cssPropertiesToString(customStyle.background)}
      }

      /* Filled is borderless by intent. antd sets no borderColor for it, so without this the base
         border would leak through regardless of the status colour. */
      ${hidesBorder ? `
      &&&& .${prefixCls}-tag {
        border: none;
      }` : ''}
    `);

  return { statusTag };
});
