import { BorderStyle, IBackgroundValue, IBorderValue, IDimensionsValue, IFontValue, IGradientValue, IShadowValue } from "@/designer-components/_settings/utils";
import { StyleBoxValue } from "../../../providers/form/models";
import { addPx, hasNumber } from "@/utils/style";
import { StringBuilder } from "@/utils";
import { isDefined } from "@/utils/nullables";

const borderCss = (b: BorderStyle | undefined): string => `${addPx(b?.width) ?? ''} ${b?.style ?? ''} ${b?.color ?? ''}`;

const gradientCss = (g: IGradientValue): string => {
  const direction = g.direction;
  const isRadial = direction === 'radial';
  const isConic = direction === 'conic';
  const colors = g.colors || {};
  const colorsString = Object.values(colors).filter((color) => Boolean(color) && color.trim() !== '').join(', ');
  return colorsString
    ? isRadial || isConic
      ? `${direction}-gradient(${colorsString})`
      : `linear-gradient(${direction || 'to right'}, ${colorsString})`
    : '';
};

const dimensionCss = (value: string | number, _canvasValue?: string): string | number => {
  // If canvasWidth is provided and main contains vw, convert to calc
  /* if (canvasValue && typeof value === 'string' && /vw/i.test(value)) {
    return dimensionRelativeToCanvas(value, canvasValue, 'vw');
  }*/

  // For simple numeric values or values without vw, use addPx
  if (typeof value === 'string' && /^calc\(/i.test(value.trim())) return value;
  return !hasNumber(value) ? value : addPx(value) ?? 0;
};

export const shadowStyles = (model: IShadowValue | undefined): string => model
  ? `box-shadow: ${model.offsetX ?? 0}px ${model.offsetY ?? 0}px ${model.blurRadius ?? 0}px ${model.spreadRadius ?? 0}px ${Boolean(model.color) ? model.color : '#00000004'};`
  : '';

export const borderStyles = (model: IBorderValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.borderType === 'all' && model.border?.all) sb.append(`border: ${borderCss(model.border.all)};`);
  if (model.borderType !== 'all' && model.border?.top) sb.append(`border-top: ${borderCss(model.border.top)};`);
  if (model.borderType !== 'all' && model.border?.right) sb.append(`border-right: ${borderCss(model.border.right)};`);
  if (model.borderType !== 'all' && model.border?.bottom) sb.append(`border-bottom: ${borderCss(model.border.bottom)};`);
  if (model.borderType !== 'all' && model.border?.left) sb.append(`border-left: ${borderCss(model.border.left)};`);
  if (model.radiusType === 'all' && Boolean(model.radius?.all)) sb.append(`border-radius: ${addPx(model.radius?.all)};`);
  if (model.radiusType !== 'all' && model.radius)
    sb.append(`border-radius: ${addPx(model.radius.topLeft ?? 0)} ${addPx(model.radius.topRight ?? 0)} ${addPx(model.radius.bottomRight ?? 0)} ${addPx(model.radius.bottomLeft ?? 0)};`);
  return sb.build();
};

export const backgroundStyles = (model: IBackgroundValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (model.type === 'color' && Boolean(model.color)) sb.append(`background-color: ${model.color};`);
  if (model.type === 'gradient' && model.gradient) sb.append(`background: ${gradientCss(model.gradient)};`);
  if (model.type === 'image' && model.uploadFile) sb.append(`background-image: url(${model.uploadFile.url || model.uploadFile});`);
  if (model.type === 'url' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (model.type === 'storedFile' && Boolean(model.url)) sb.append(`background-image: url(${model.url});`);
  if (Boolean(model.size)) sb.append(`background-size: ${model.size};`);
  if (model.repeat) sb.append(`background-repeat: ${model.repeat};`);
  if (Boolean(model.position)) sb.append(`background-position: ${model.position};`);
  return sb.build();
};

export const dimensionsStyles = (model: IDimensionsValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (isDefined(model.width)) sb.append(`width: ${dimensionCss(model.width)};`);
  if (isDefined(model.minWidth)) sb.append(`min-width: ${dimensionCss(model.minWidth)};`);
  if (isDefined(model.maxWidth)) sb.append(`max-width: ${dimensionCss(model.maxWidth)};`);
  if (isDefined(model.height)) sb.append(`height: ${dimensionCss(model.height)};`);
  if (isDefined(model.minHeight)) sb.append(`min-height: ${dimensionCss(model.minHeight)};`);
  if (isDefined(model.maxHeight)) sb.append(`max-height: ${dimensionCss(model.maxHeight)};`);
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

export const fontStyles = (model: IFontValue | undefined): string => {
  if (!model) return '';
  const sb = new StringBuilder();
  if (Boolean(model.color)) sb.append(`color: ${model.color};`);
  if (isDefined(model.size)) sb.append(`font-size: ${addPx(model.size)};`);
  if (Boolean(model.weight)) sb.append(`font-weight: ${model.weight};`);
  if (Boolean(model.type)) sb.append(`font-family: ${model.type};`);
  if (isDefined(model.align)) sb.append(`text-align: ${model.align};`);
  return sb.build();
};
