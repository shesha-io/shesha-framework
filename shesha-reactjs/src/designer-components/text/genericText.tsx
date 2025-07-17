import classNames from 'classnames';
import React, { CSSProperties, FC, PropsWithChildren, useEffect, useState } from 'react';
import { ContentType, ITextTypographyProps, ITypographyProps } from './models';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TitleProps } from 'antd/lib/typography/Title';
import { BaseType } from 'antd/lib/typography/Base';
import { useStyles } from './styles/styles';
import { Typography } from 'antd';
import { IConfigurableTheme, useTheme } from '@/providers';

const { Paragraph, Title } = Typography;

type LevelType = 1 | 2 | 3 | 4 | 5;

interface IGenericTextProps
  extends Omit<ITextTypographyProps, 'style' | 'contentDisplay' | 'name' | 'id' | 'type' | 'content' | 'value'> {
  style?: CSSProperties;
}

const getColorByContentType = (contentType: ContentType, style: CSSProperties, theme: IConfigurableTheme) => {
  switch (contentType) {
    case 'custom':
      return style?.color;
    case 'secondary':
      return theme?.text?.secondary;
    case '':
      return theme?.text?.default;
    default:
      return undefined;
  }
};

export const GenericText: FC<PropsWithChildren<IGenericTextProps>> = ({
  children,
  backgroundColor,
  color,
  contentType,
  dataType,
  dateFormat,
  level,
  size,
  numberFormat,
  textType,
  style,
  ...model
}) => {
  const { styles } = useStyles();
  const [updateKey, setUpdateKey] = useState(0);
  // NOTE: to be replaced with a generic context implementation
  const { theme } = useTheme();

  useEffect(() => {
    setUpdateKey((prev) => prev + 1);
  }, [
    model.italic,
    model.code,
    model.copyable,
    model.delete,
    model.ellipsis,
    model.mark,
    model.underline,
    model.keyboard,
    model.strong,
  ]);

  const chosenType: BaseType | undefined = contentType === 'secondary' ? undefined : (contentType as BaseType);

  const baseProps: ITypographyProps = {
    code: model?.code,
    copyable: model?.copyable,
    delete: model?.delete,
    ellipsis: model?.ellipsis,
    mark: model?.mark,
    underline: model?.underline,
    keyboard: model?.keyboard,
    italic: model?.italic,
    type: chosenType,
    style: {
      padding: 0,
      margin: 0,
      ...{
      ...style,
      color: getColorByContentType(contentType, style, theme),
      fontSize: textType === 'title' ? undefined : style?.fontSize,
      justifyContent: style?.textAlign,
    }},
  };

  const paragraphProps: ParagraphProps = {
    ...baseProps,
    strong: model?.strong,
  };

  const titleProps: TitleProps = {
    ...baseProps,
    level: level ? (Number(level) as LevelType) : 1,
  };

  const className = classNames(styles.typographyText, {
    [styles.primary]: contentType === 'primary',
    [styles.info]: contentType === 'info',
  });

  if (textType === 'span') {
    return (
      <Paragraph key={`text-${updateKey}`} {...baseProps} className={className}>
        {children}
      </Paragraph>
    );
  }

  if (textType === 'paragraph') {
    return (
      <Paragraph key={`paragraph-${updateKey}`} style={{margin: '0px'}}  {...paragraphProps} className={className}>
        {children}
      </Paragraph>
    );
  }

  return (
    <Title key={`title-${updateKey}`} style={{margin: '0px'}}  {...titleProps} className={className}>
      {children}
    </Title>
  );
};
