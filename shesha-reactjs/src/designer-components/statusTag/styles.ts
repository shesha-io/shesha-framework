import { createStyles } from '@/styles';
import { backgroundStyles, borderRadiusStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles, splitBackgroundProperties } from '@/designer-components/_common/styles/utils';
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

  // Built outside the template: the attribute selectors need quotes, which would terminate the
  // tagged template literal if written inline.
  //
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

  const statusTag = cx('sha-status-tag', css`
      /* The wrapper is layout only — it positions the tag and is otherwise invisible. Margin lives
         here rather than on the tag so it separates the component from its neighbours, which is
         what margin means for a component that renders a single tag. */
      ${marginStyles(model.stylingBoxJson)}
      display: inline-flex;
      align-items: center;
      ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}

      &&& .${prefixCls}-tag {
        /* Some antd ancestors zero --ant-line-width, and custom properties inherit — so without
           restoring it the tag border resolves to 0 and Outlined looks like Filled. */
        --ant-line-width: ${token.lineWidth}px;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        cursor: default;
        margin: 0;
        ${borderRadiusStyles(model.border)}
        ${shadowStyles(model.shadow)}
        ${dimensionsStyles(model.dimensions)}
        ${paddingStyles(model.stylingBoxJson)}
        ${fontWithoutColour}
        ${cssPropertiesToString(customStyle.rest)}

        /* Restated or the tag box resizes without its text following. Colour is left off so the
           label keeps inheriting whichever colour won on the tag itself. */
        .anticon,
        span {
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
