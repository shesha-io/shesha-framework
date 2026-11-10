import {
  ContentType,
  ITextComponentProps,
  ITextComponentPropsV0,
} from './models';
import { IStyleValue } from '@/interfaces';
import { isDefined } from '@/utils/nullables';
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';

export const defaultStyles = (model?: ITextComponentPropsV0 | undefined): IStyleValue & { level: number } => {
  return {
    level: 0,
    font: { color: '#000', type: DEFAULT_FONT_TYPE, align: 'left', weight: '400', size: model?.textType === 'title' ? undefined : 14 },
    background: { type: 'color', color: '' },
    border: {
      border: {
        all: { width: 1, style: 'none', color: '#d9d9d9' },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'fit-content',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '0', paddingBottom: '0', paddingTop: '0', paddingRight: '0', marginLeft: '0', marginBottom: '0', marginTop: '0', marginRight: '0' },
  };
};

export const remToPx = (remValue: string | number | undefined, rootFontSize = 14): number => {
  if (typeof remValue !== 'string') return rootFontSize;
  const match = remValue.trim().match(/^([0-9.]+)rem$/);
  if (!match) return rootFontSize;
  const rem = parseFloat(match[1] ?? "");
  if (isNaN(rem)) return rootFontSize;
  return rem * rootFontSize;
};

const isContentTypeUnset = (contentType: ContentType | undefined): boolean => contentType === undefined || contentType === '';

const getContentType = (deviceModel: object | undefined): ContentType | undefined =>
  (deviceModel as { contentType?: ContentType | undefined } | undefined)?.contentType;

/**
 * Gives an unset or empty Type its own 'default' value (it used to be the "Default" option), so the
 * dropdown shows it. An empty Type was chosen explicitly, so it always becomes 'default'. A missing one
 * is inherited - desktop from the root, tablet and mobile from desktop (see `getEffectiveStyle`) - so it
 * only becomes 'default' when there is no Type to inherit.
 */
export const migrateDefaultContentType = (model: ITextComponentProps): ITextComponentProps => {
  const rootUnset = isContentTypeUnset(model.contentType);
  const desktopInheritsNothing = rootUnset && isContentTypeUnset(getContentType(model.desktop));
  const withDefault = <T extends object>(deviceModel: T | undefined, inheritsNothing: boolean): T | undefined => {
    const contentType = getContentType(deviceModel);
    return isDefined(deviceModel) && (contentType === '' || (contentType === undefined && inheritsNothing))
      ? { ...deviceModel, contentType: 'default' }
      : deviceModel;
  };
  return {
    ...model,
    ...(rootUnset ? { contentType: 'default' as const } : {}),
    desktop: withDefault(model.desktop, rootUnset),
    tablet: withDefault(model.tablet, desktopInheritsNothing),
    mobile: withDefault(model.mobile, desktopInheritsNothing),
  };
};
