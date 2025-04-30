import classNames from 'classnames';
import React, { CSSProperties, FC, PropsWithChildren, useEffect, useState } from 'react';
import { ITextTypographyProps, ITypographyProps } from './models';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TextProps } from 'antd/lib/typography/Text';
import { TitleProps } from 'antd/lib/typography/Title';
import { useStyles } from './styles/styles';
import { Typography } from 'antd';

const { Paragraph, Text, Title } = Typography;

type LevelType = 1 | 2 | 3 | 4 | 5;

interface IGenericTextProps
  extends Omit<ITextTypographyProps, 'style' | 'contentDisplay' | 'name' | 'id' | 'type' | 'content' | 'value'> {
  style?: CSSProperties;
}

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

  const baseProps: ITypographyProps = {
    code: model?.code,
    copyable: model?.copyable,
    delete: model?.delete,
    ellipsis: model?.ellipsis,
    mark: model?.mark,
    underline: model?.underline,
    keyboard: model?.keyboard,
    italic: model?.italic,
    type: contentType !== 'custom' && contentType !== 'info' && contentType !== 'primary' ? contentType : null,
    style: {
      ...style,
      color: contentType === 'custom' ? style.color : undefined,
      fontSize: textType === 'title' ? undefined : style?.fontSize,
      justifyContent: style?.textAlign,
    },
  };

  const textProps: TextProps = {
    ...baseProps,
    strong: model?.strong,
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
      <Text key={`text-${updateKey}`} {...textProps} className={className}>
        {children}
      </Text>
    );
  }

  if (textType === 'paragraph') {
    return (
      <Paragraph key={`paragraph-${updateKey}`} {...paragraphProps} className={className}>
        {children}
      </Paragraph>
    );
  }

  return (
    <Title key={`title-${updateKey}`} {...titleProps} className={className}>
      {children}
    </Title>
  );
};
