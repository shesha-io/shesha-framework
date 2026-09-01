import { BorderStyle, getGradientColors, IBackgroundValue, IBorderValue, IDimensionsValue, IFontValue, IGradientValue, IShadowValue } from "@/designer-components/_settings/utils";
import { IConfigurableFormComponent, IStyleValue, StyleBoxValue } from "../../../providers/form/models";
import { addPx, hasNumber } from "@/utils/style";
import { boundWidthToCanvas } from "@/designer-components/_settings/utils/dimensions/bounds";
import { dimensionRelativeToCanvas } from "@/providers/canvas/constants";
import { StringBuilder } from "@/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { CSSProperties } from "react";

/** Properties that are unitless in CSS, so a bare number must not gain a `px` suffix. */
const UNITLESS_PROPERTIES = new Set([
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth',
  'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'columns', 'flex', 'flexGrow', 'flexPositive',
  'flexShrink', 'flexNegative', 'flexOrder', 'gridRow', 'gridColumn', 'fontWeight', 'lineClamp', 'lineHeight',
  'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'zoom',
  // SVG presentation attributes React accepts on CSSProperties.
  'fillOpacity', 'floodOpacity', 'stopOpacity', 'strokeDasharray', 'strokeMiterlimit', 'strokeOpacity',
  'strokeWidth',
  // Vendor-prefixed forms of the above; React spells these with a capitalised prefix.
  'WebkitLineClamp', 'WebkitBoxOrdinalGroup', 'WebkitFlexGrow', 'WebkitFlexShrink', 'WebkitOrder',
  'MozBoxFlex', 'msFlex', 'msFlexPositive', 'msGridRow', 'msGridColumn',
]);

/**
 * Serialises a React `CSSProperties` object into a CSS declaration string suitable for
 * interpolation into an emotion template literal.
 *
 * Emotion's `CSSObject` is not structurally compatible with React's `CSSProperties`, so a custom
 * style object cannot simply be spread into a `css` block. Keys are kebab-cased, `--custom-props`
 * are passed through untouched, and `px` is appended only to numeric values of properties that
 * actually take a length (see `UNITLESS_PROPERTIES`).
 */
export const cssPropertiesToString = (style: CSSProperties | undefined): string => {
  if (!isDefined(style)) return '';
  const sb = new StringBuilder();
  Object.entries(style).forEach(([key, value]) => {
    if (!isDefined(value) || value === '') return;
    // Custom properties are already in their final form and must keep their exact casing.
    // React writes the Microsoft prefix lowercase (`msFlex`), which plain kebab-casing would
    // render as `ms-flex`; the vendor declaration needs the leading dash. The other prefixes
    // (`WebkitBoxShadow`, `MozAppearance`) capitalise, so the generic rule already emits theirs.
    const name = key.startsWith('--')
      ? key
      : (/^ms[A-Z]/.test(key) ? `-${key}` : key).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    const serialised = typeof value === 'number' && !UNITLESS_PROPERTIES.has(key)
      ? `${value}px`
      : String(value);
    sb.append(`${name}: ${serialised};`);
  });
  return sb.build();
};

/**
 * Splits a custom style object into its background-related declarations and everything else.
 *
 * Some components deliberately scope their Background panel to a state selector (a checkbox or
 * radio indicator only fills when checked; a dropdown tag only takes the configured colour when
 * the option carries none). A custom style applied to the unconditional selector would paint the
 * element in states the panel intentionally leaves alone. Splitting lets the caller route the
 * background half to the same selector the panel uses and the rest to the base rule.
 *
 * Every `background*` longhand travels with the shorthand so a single visual intent is never
 * split across two states.
 */
export const splitBackgroundProperties = (style: CSSProperties | undefined): { background: CSSProperties; rest: CSSProperties } => {
  // Built as plain records because `CSSProperties` has no string index signature, and its keys and
  // values cannot be correlated when read back as a union — assigning one to the other does not
  // typecheck. The narrowing happens on return, where the keys are known to have come from a
  // `CSSProperties` object.
  const background: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  if (!isDefined(style)) return { background: {}, rest: {} };
  Object.entries(style).forEach(([key, value]) => {
    const target = key.startsWith('background') ? background : rest;
    target[key] = value;
  });
  return { background: background as CSSProperties, rest: rest as CSSProperties };
};

/** Custom-style properties that describe text rather than the box that contains it. */
const TEXT_STYLE_PROPERTIES = new Set([
  'color', 'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch',
  'lineHeight', 'letterSpacing', 'wordSpacing', 'textAlign', 'textDecoration', 'textTransform',
  'textShadow', 'textIndent', 'whiteSpace', 'wordBreak', 'textOverflow', 'direction',
]);

/**
 * Splits a custom style into the properties that style text and everything else.
 *
 * A dropdown popup needs the two halves on different elements. The box half (background, border,
 * padding, shadow) belongs on the panel, but the text half has to be restated on each option: antd
 * sets colour and font on the option element itself, so a rule on an ancestor — or an inline style
 * on the popup root — is overridden rather than inherited, and the user's colour and font size
 * silently do nothing.
 *
 * Dimensions are deliberately in neither half: callers drop them before splitting, since a popup is
 * sized to its trigger or its content.
 */
export const splitTextProperties = (style: CSSProperties | undefined): { text: CSSProperties; box: CSSProperties } => {
  // Plain records for the same reason as `splitBackgroundProperties` above: `CSSProperties` has no
  // index signature and its key/value union cannot be correlated when read back.
  const text: Record<string, unknown> = {};
  const box: Record<string, unknown> = {};
  if (!isDefined(style)) return { text: {}, box: {} };
  Object.entries(style).forEach(([key, value]) => {
    const target = TEXT_STYLE_PROPERTIES.has(key) ? text : box;
    target[key] = value;
  });
  return { text: text as CSSProperties, box: box as CSSProperties };
};

export const getStyleValueFromModel = (model: IConfigurableFormComponent): IStyleValue => {
  return {
    border: model.border,
    background: model.background,
    font: model.font,
    shadow: model.shadow,
    dimensions: model.dimensions,
    size: model.size,
    style: model.style,
    styleCss: model.styleCss,
    /** @deprecated use stylingBoxJson insted */
    stylingBox: model.stylingBox,
    stylingBoxJson: model.stylingBoxJson,
    primaryTextColor: model.primaryTextColor,
    primaryBgColor: model.primaryBgColor,
    secondaryBgColor: model.secondaryBgColor,
    secondaryTextColor: model.secondaryTextColor,
    overflow: model.overflow,
    hideScrollBar: model.hideScrollBar,
    autoWidth: model.autoWidth,
    autoHeight: model.autoHeight,
  };
};

export const borderCss = (b: BorderStyle | undefined): string => `${addPx(b?.width) ?? '0px'} ${b?.style ?? 'none'} ${b?.color ?? 'transparent'}`;

export const gradientCss = (g: IGradientValue): string => {
  const direction = g.direction;
  const isRadial = direction === 'radial';
  const isConic = direction === 'conic';
  const colorsString = getGradientColors(g.colors).join(', ');
  return colorsString
    ? isRadial || isConic
      ? `${direction}-gradient(${colorsString})`
      : `linear-gradient(${direction || 'to right'}, ${colorsString})`
    : '';
};

/** Serialises a dimension already resolved against the canvas by the caller. */
const dimensionCss = (value: string | number): string | number => {
  if (typeof value === 'string' && /^calc\(/i.test(value.trim())) return value;
  return !hasNumber(value) ? value : addPx(value) ?? 0;
};

export const shadowStyles = (model: IShadowValue | undefined, propertyName: string = 'box-shadow', important: boolean = false): string => model
  ? `${propertyName}: ${model.offsetX ?? 0}px ${model.offsetY ?? 0}px ${model.blurRadius ?? 0}px ${model.spreadRadius ?? 0}px ${Boolean(model.color) ? model.color : '#00000004'}${important === true ? ' !important' : ''};`
  : '';

export const borderRadiusStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.radiusType === 'all' && isDefined(model.radius?.all)) sb.append(`border-radius: ${addPx(model.radius.all)} ${important === true ? '!important' : ''};`);
  if (model.radiusType !== 'all' && model.radius)
    sb.append(`border-radius: ${addPx(model.radius.topLeft ?? 0)} ${addPx(model.radius.topRight ?? 0)} ${addPx(model.radius.bottomRight ?? 0)} ${addPx(model.radius.bottomLeft ?? 0)} ${important === true ? '!important' : ''};`);
  return sb.build();
};

export const borderLinesStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.borderType === 'all' && model.border?.all) sb.append(`border: ${borderCss(model.border.all)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.top) sb.append(`border-top: ${borderCss(model.border.top)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.right) sb.append(`border-right: ${borderCss(model.border.right)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.bottom) sb.append(`border-bottom: ${borderCss(model.border.bottom)} ${important === true ? '!important' : ''};`);
  if (model.borderType !== 'all' && model.border?.left) sb.append(`border-left: ${borderCss(model.border.left)} ${important === true ? '!important' : ''};`);
  return sb.build();
};

export const borderStyles = (model: IBorderValue | undefined, important: boolean = false): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  sb.append(borderLinesStyles(model, important));
  sb.append(borderRadiusStyles(model, important));
  return sb.build();
};

export const backgroundCss = (bg: IBackgroundValue | undefined): string => {
  if (!isDefined(bg)) return 'transparent';
  if (bg.type === 'color' && isDefined(bg.color)) return bg.color || 'transparent';
  if (bg.type === 'gradient' && isDefined(bg.gradient)) return gradientCss(bg.gradient) || 'transparent';
  if (bg.type === 'image' && isDefined(bg.uploadFile)) return `url(${bg.uploadFile.url || bg.uploadFile})`;
  if (bg.type === 'url' && isDefined(bg.url)) return `url(${bg.url})`;
  if (bg.type === 'storedFile' && isDefined(bg.url)) return `url(${bg.url})`;
  return 'transparent';
};

export const backgroundStyles = (model: IBackgroundValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.type === 'color' && Boolean(model.color)) sb.append(`background: ${model.color};`);
  if (model.type === 'gradient' && model.gradient) sb.append(`background: ${gradientCss(model.gradient)};`);
  if (model.type === 'image' && model.uploadFile) sb.append(`background-image: url(${model.uploadFile.url || model.uploadFile});`);
  if (model.type === 'url' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (model.type === 'storedFile' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (Boolean(model.size)) sb.append(`background-size: ${model.size};`);
  if (model.repeat) sb.append(`background-repeat: ${model.repeat};`);
  if (Boolean(model.position)) sb.append(`background-position: ${model.position};`);
  return sb.build();
};

export const dimensionsStyles = (model: IDimensionsValue | undefined, canvasWidth?: string, canvasHeight?: string): string => {
  if (!model) return '';
  const sb = new StringBuilder();

  // On the canvas vh means the canvas pane; with no canvas it is the viewport it was asked for.
  const height = (value: string | number): string | number =>
    isDefined(canvasHeight) && typeof value === 'string' && /vh/i.test(value)
      ? dimensionRelativeToCanvas(value, canvasHeight, 'vh')
      : value;

  // The width axes match getDimensionsStyle: bounded against the canvas and resolved against it,
  // and left exactly as configured when there is no canvas to judge them by.
  const width = (value: string | number): string | number => {
    if (!isDefined(canvasWidth)) return value;
    const bounded = boundWidthToCanvas(value, canvasWidth);
    return typeof bounded === 'string' && /vw/i.test(bounded)
      ? dimensionRelativeToCanvas(bounded, canvasWidth, 'vw')
      : bounded;
  };

  if (isDefined(model.width)) sb.append(`width: ${dimensionCss(width(model.width))};`);
  if (isDefined(model.minWidth)) sb.append(`min-width: ${dimensionCss(width(model.minWidth))};`);
  if (isDefined(model.maxWidth)) sb.append(`max-width: ${dimensionCss(width(model.maxWidth))};`);
  // The height axes resolve vh against the canvas: this is the path the container component uses,
  // and a container is the usual place a full-viewport height is set.
  if (isDefined(model.height)) sb.append(`height: ${dimensionCss(height(model.height))};`);
  if (isDefined(model.minHeight)) sb.append(`min-height: ${dimensionCss(height(model.minHeight))};`);
  if (isDefined(model.maxHeight)) sb.append(`max-height: ${dimensionCss(height(model.maxHeight))};`);
  if (isDefined(model.gridRow) && model.gridRow > 0) sb.append(`grid-row: span ${model.gridRow};`);
  if (isDefined(model.gridColumn) && model.gridColumn > 0) sb.append(`grid-column: span ${model.gridColumn};`);
  return sb.build();
};

export const marginStyles = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.marginBottom)) sb.append(`margin-bottom: ${addPx(model.marginBottom)};`);
  if (isDefined(model.marginTop)) sb.append(`margin-top: ${addPx(model.marginTop)};`);
  if (isDefined(model.marginLeft)) sb.append(`margin-left: ${addPx(model.marginLeft)};`);
  if (isDefined(model.marginRight)) sb.append(`margin-right: ${addPx(model.marginRight)};`);
  return sb.build();
};

export const paddingStyles = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.paddingBottom)) sb.append(`padding-bottom: ${addPx(model.paddingBottom)};`);
  if (isDefined(model.paddingTop)) sb.append(`padding-top: ${addPx(model.paddingTop)};`);
  if (isDefined(model.paddingLeft)) sb.append(`padding-left: ${addPx(model.paddingLeft)};`);
  if (isDefined(model.paddingRight)) sb.append(`padding-right: ${addPx(model.paddingRight)};`);
  return sb.build();
};

export const paddingValue = (model: StyleBoxValue | undefined): string => {
  if (!model) return '';
  const sb = [];
  sb.push(addPx(isDefined(model.paddingTop) ? model.paddingTop : 0));
  sb.push(addPx(isDefined(model.paddingRight) ? model.paddingRight : 0));
  sb.push(addPx(isDefined(model.paddingBottom) ? model.paddingBottom : 0));
  sb.push(addPx(isDefined(model.paddingLeft) ? model.paddingLeft : 0));
  return sb.join(' ');
};

export const fontStyles = (model: IFontValue | undefined, customStyle?: CSSProperties | undefined): string => {
  /* An explicit Custom style wins over the model's own `styleCss`, so a caller that has already
     narrowed it — stripping `textAlign` for a calendar cell, say — keeps that narrowing. Either way
     only the text properties are used, so a full Custom style can be handed over as-is. */
  const custom = splitTextProperties(customStyle).text;
  const sb = new StringBuilder();

  /* Read from the Custom style first, falling back to the Font model. `fontSize` is passed through
     `addPx` on the model side only: a Custom style is authored as CSS, where a bare number is either
     already a string with units or a unitless number React itself serialises with `px`. */
  const color = !isNullOrWhiteSpace(custom.color) ? custom.color : model?.color;
  const size = isDefined(custom.fontSize) ? custom.fontSize : (isDefined(model?.size) ? model.size : undefined);
  const weight = isDefined(custom.fontWeight) ? custom.fontWeight : model?.weight;
  const family = !isNullOrWhiteSpace(custom.fontFamily) ? custom.fontFamily : model?.type;
  const align = isDefined(custom.textAlign) ? custom.textAlign : model?.align;

  if (!isNullOrWhiteSpace(color)) sb.append(`color: ${color};`);
  if (isDefined(size)) sb.append(`font-size: ${addPx(size)};`);
  if (isDefined(weight) && `${weight}` !== '') sb.append(`font-weight: ${weight};`);
  if (!isNullOrWhiteSpace(family)) sb.append(`font-family: ${family};`);
  if (isDefined(align)) sb.append(`text-align: ${align};`);
  return sb.build();
};

/**
 * Emits the appearance a dropdown popup shares with the input that opens it: background and border.
 *
 * Shared by every component that opens a floating list (a select popup, a picker panel, a suggestion
 * list) so they stay consistent rather than each re-deriving the set.
 *
 * The configured **shadow is deliberately excluded** — popups keep antd's own elevation. On the input
 * a shadow is decorative, but on a panel that overlays the page it is structural, and a configured
 * offset reaches outside the popup's own footprint: `offsetY: -22` paints a band 22px up over the
 * field above it. Elevation is also the one part of a popup users expect to look native, so it is
 * left to the theme. `shadow` is absent from the parameter type on purpose, so a caller cannot pass
 * one and quietly get nothing.
 *
 * Padding is likewise not included: it belongs on the popup root for a list (insetting the whole
 * panel) but on the item for a grid-like panel, so each caller applies it where it fits.
 */
export const popupAppearanceStyles = (model: {
  background?: IBackgroundValue | undefined;
  border?: IBorderValue | undefined;
}): string => `
  ${borderStyles(model.border)}
  ${backgroundStyles(model.background)}
`;
