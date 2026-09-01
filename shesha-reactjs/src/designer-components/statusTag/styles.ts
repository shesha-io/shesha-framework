import { createStyles } from '@/styles';
import { backgroundStyles, borderRadiusStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, justifyContentFor, marginStyles, paddingStyles, shadowStyles, splitBackgroundProperties } from '@/designer-components/_common/styles/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';
import { IStatusTagComponentProps } from './model';

/**
 * The colour classes antd puts on a tag. Declared locally: `antd/es/theme/interface` is an internal
 * path, and `@ant-design/colors` omits `pink` and adds `grey`, so neither matches what antd emits.
 */
const TAG_COLOUR_CLASSES: readonly string[] = [
  'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano',
  'geekblue', 'lime', 'gold',
  'success', 'processing', 'error', 'default', 'warning',
];

/**
 * The single Appearance set, scoped onto the tag rather than the wrapper — the component *is* the
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
      /* Auto: the select hugs its tag rather than taking the fixed antd control height. */
      &&& {
        ${isDefined(model.dimensions?.width) && model.dimensions.width !== 'auto' ? '' : 'width: max-content;'}
        ${isDefined(model.dimensions?.height) && model.dimensions.height !== 'auto' ? '' : 'height: max-content;'}
      }

      /* The visible box is the selector, not the root — cleared so only the tag reads as a box, and
         centred so the tag does not sit at the top of a taller row. Font align is deliberately not
         applied here: it belongs to the text inside the tag, not to the tag's position in the row. */
      &.${prefixCls}-select .${prefixCls}-select-selector {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        height: 100%;
        display: flex;
        align-items: center;
      }

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
      /* Shrink-wrapped so the hover and click target is the tag, not the whole field. */
      &&& .sha-status-tag-wrapper {
        width: max-content;
        max-width: 100%;
      }

      &&&${tagWrapperSelector},
      &&& ${tagWrapperSelector} {
        justify-content: flex-start;
        align-items: center;

        /* Overrides the inline full width the read-only renderer sets. */
        width: max-content;
        max-width: 100%;
        /* The events are bound to an ancestor of this row, so without this they fire anywhere along
           it rather than on the tag. */
        pointer-events: none;
      }

      &&& .${prefixCls}-tag {
        pointer-events: auto;
      }

      /* antd's per-selection wrapper carries its own background, border and padding, which reads as
         a box around the tag. Margin is left alone — that is the gap between selections. */
      &&& .${prefixCls}-select-selection-item {
        background: transparent;
        border: none;
        padding: 0;
        height: auto;
        display: flex;
        align-items: center;
        /* antd fakes vertical centring with line-height, which only skews a flex tag. */
        line-height: normal;
      }

      /* Inherited so the close icon matches its tag rather than antd's muted default. */
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
