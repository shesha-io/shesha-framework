import classNames from 'classnames';
import { FC, PropsWithChildren, useMemo } from 'react';
import { ContentType, ITextComponentProps, ITypographyProps } from './models';
import { TitleProps } from 'antd/lib/typography/Title';
import { BaseType } from 'antd/lib/typography/Base';
import { useStyles } from './styles/styles';
import { Typography } from 'antd';
import { IConfigurableTheme, useTheme } from '@/providers';
import { EMPTY_STYLE } from '@/styles/variables';
import { IStyleValue } from '@/interfaces';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

const { Paragraph, Title } = Typography;

type StrongLevelType = 1 | 2 | 3 | 4 | 5;

/**
 * Font colour the theme gives a Text component: its own override on the Components tab, else the
 * Inline Components font colour (Text is an inline component), else `undefined`.
 */
const getThemeFontColor = (theme: IConfigurableTheme | undefined, componentType: string): string | undefined => {
  const componentColor = (theme?.components?.[componentType] as IStyleValue | undefined)?.font?.color;
  if (isNotNullOrWhiteSpace(componentColor)) return componentColor;
  const groupColor = theme?.componentGroups?.inline?.font?.color;
  return isNotNullOrWhiteSpace(groupColor) ? groupColor : undefined;
};

export const getColorByContentType = (contentType: ContentType | undefined, color: string | undefined, theme: IConfigurableTheme | undefined, componentType: string = 'text'): string | undefined => {
  switch (contentType) {
    case 'custom':
      return color;
    case 'secondary':
      return theme?.text?.secondary;
    case '':
      // Default text follows the inline components' font colour, then the theme's default text colour.
      return getThemeFontColor(theme, componentType) ?? theme?.text?.default;
    default:
      return undefined;
  }
};

const isBaseType = (value: unknown): value is BaseType =>
  typeof value === 'string' && ['secondary', 'success', 'warning', 'danger'].includes(value);

export const GenericText: FC<PropsWithChildren<ITextComponentProps & { additionalDomProperties: Record<string, unknown> }>> = (model) => {
  const { children, contentType, level = 0 } = model;

  const { theme } = useTheme();
  const { styles } = useStyles({ ...model, font: { ...model.font, color: getColorByContentType(contentType, model.font?.color, theme, model.type) } });

  const chosenType: BaseType | undefined = isBaseType(contentType) ? contentType : undefined;

  const baseProps: ITypographyProps = useMemo(() => ({
    copyable: model.copyable ?? false,
    delete: model.delete ?? false,
    underline: model.underline ?? false,
    italic: model.italic ?? false,
    ...(chosenType ? { type: chosenType } : {}),
    style: model.styleCss,
  }), [model.copyable, model.delete, model.underline, model.italic, model.styleCss, chosenType]);

  const titleProps: TitleProps = useMemo(() => ({ ...baseProps, style: baseProps.style ?? {}, level: level > 0 ? level as StrongLevelType : 5 }), [baseProps, level]);

  const className = classNames(styles.typographyText, {
    [styles.primary]: contentType === 'primary',
    [styles.info]: contentType === 'info',
  });

  return level > 0
    ? <Title {...titleProps} className={className} {...model.additionalDomProperties}>{children}</Title>
    : <Paragraph {...baseProps} className={className} style={model.styleCss ?? EMPTY_STYLE} {...model.additionalDomProperties}>{children}</Paragraph>;
};
