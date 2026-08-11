import classNames from 'classnames';
import { FC, PropsWithChildren, useMemo } from 'react';
import { ContentType, ITextComponentProps, ITypographyProps } from './models';
import { TitleProps } from 'antd/lib/typography/Title';
import { BaseType } from 'antd/lib/typography/Base';
import { useStyles } from './styles/styles';
import { Typography } from 'antd';
import { IConfigurableTheme, useTheme } from '@/providers';

const { Paragraph, Title } = Typography;

type StrongLevelType = 1 | 2 | 3 | 4 | 5;

const getColorByContentType = (contentType: ContentType | undefined, color: string | undefined, theme: IConfigurableTheme | undefined): string | undefined => {
  switch (contentType) {
    case 'custom':
      return color;
    case 'secondary':
      return theme?.text?.secondary;
    case '':
      return theme?.text?.default;
    default:
      return undefined;
  }
};

const isBaseType = (value: unknown): value is BaseType =>
  typeof value === 'string' && ['secondary', 'success', 'warning', 'danger'].includes(value);

export const GenericText: FC<PropsWithChildren<ITextComponentProps & { additionalDomProperties: Record<string, unknown> }>> = (model) => {
  const { children, contentType, level = 0 } = model;

  const { theme } = useTheme();
  const { styles } = useStyles({ ...model, font: { ...model.font, color: getColorByContentType(contentType, model.font?.color, theme) } });

  const chosenType: BaseType | undefined = isBaseType(contentType) ? contentType : undefined;

  const baseProps: ITypographyProps = useMemo(() => ({
    code: model.code ?? false,
    copyable: model.copyable ?? false,
    delete: model.delete ?? false,
    ellipsis: model.ellipsis ?? false,
    mark: model.mark ?? false,
    underline: model.underline ?? false,
    keyboard: model.keyboard ?? false,
    italic: model.italic ?? false,
    ...(chosenType ? { type: chosenType } : {}),
    style: model.styleJson ?? {},
  }), [model.code, model.copyable, model.delete, model.ellipsis, model.mark, model.underline, model.keyboard, model.italic, model.styleJson, chosenType]);

  const titleProps: TitleProps = useMemo(() => ({ ...baseProps, style: baseProps.style ?? {}, level: level > 0 ? level as StrongLevelType : 5 }), [baseProps, level]);

  const className = classNames(styles.typographyText, {
    [styles.primary]: contentType === 'primary',
    [styles.info]: contentType === 'info',
  });

  return level > 0
    ? <Title {...titleProps} className={className} {...model.additionalDomProperties}>{children}</Title>
    : <Paragraph {...baseProps} className={className} style={model.styleJson ?? {}} {...model.additionalDomProperties}>{children}</Paragraph>;
};
