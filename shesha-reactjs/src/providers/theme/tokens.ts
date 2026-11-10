import { ThemeConfig } from 'antd';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import type { IConfigurableTheme } from './contexts';

/** Ant Design colour tokens for a theme's application colours; colours it leaves unset are omitted. */
export const getApplicationColorTokens = (appTheme: IConfigurableTheme['application']): Partial<NonNullable<ThemeConfig['token']>> => appTheme
  ? {
    ...(isNotNullOrWhiteSpace(appTheme.primaryColor) ? { colorPrimary: appTheme.primaryColor, colorLink: appTheme.primaryColor } : {}),
    ...(isNotNullOrWhiteSpace(appTheme.infoColor) ? { colorInfo: appTheme.infoColor } : {}),
    ...(isNotNullOrWhiteSpace(appTheme.successColor) ? { colorSuccess: appTheme.successColor } : {}),
    ...(isNotNullOrWhiteSpace(appTheme.errorColor) ? { colorError: appTheme.errorColor } : {}),
    ...(isNotNullOrWhiteSpace(appTheme.warningColor) ? { colorWarning: appTheme.warningColor } : {}),
  }
  : {};
