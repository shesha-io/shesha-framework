import { Alert, Typography } from 'antd';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TextProps } from 'antd/lib/typography/Text';
import { TitleProps } from 'antd/lib/typography/Title';
import React, { CSSProperties, FC, PropsWithChildren, useMemo } from 'react';
import { useForm, useFormData, useTheme } from '@/providers';
import { evaluateString, getStyle } from '@/providers/form/utils';
import { ITextTypographyProps, ITypographyProps } from './models';
import {
  DEFAULT_PADDING_SIZE,
  getContent,
  getFontSizeStyle,
  getPaddingSizeStyle,
} from './utils';
import './styles/index.less';
import classNames from 'classnames';

const { Paragraph, Text, Title } = Typography;

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

const TypographyComponent: FC<ITextTypographyProps> = ({
  contentDisplay,
  dataType,
  dateFormat,
  numberFormat,
  value,
  style,
  ...model
}) => {
  const { formMode } = useForm();
  const { data: formData } = useFormData();

  const contentEvaluation = evaluateString(value, formData);
  const content = getContent(contentEvaluation, { dataType, dateFormat, numberFormat });

  if (!content && contentDisplay === 'content' && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }

  const computedStyle = getStyle(style, formData) ?? {};

  return (
    <GenericText style={computedStyle} {...model}>
      {content}
    </GenericText>
  );
};

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
  fontSize,
  level,
  numberFormat,
  padding = DEFAULT_PADDING_SIZE,
  textType,
  style,
  ...model
}) => {
  const { theme } = useTheme();
  // NOTE: to be replaced with a generic context implementation
  const sizeIdentifier = textType === 'title' ? level : fontSize;

  const fontSizeStyle = typeof sizeIdentifier === 'string' ? getFontSizeStyle(sizeIdentifier) : {};
  const paddingStyle = getPaddingSizeStyle(padding);

  const textColor = useMemo(() => {
    if (!contentType) return theme?.text?.default;

    if (contentType === 'secondary') return theme?.text?.secondary;

    if (contentType === 'custom' && color) return color.hex;

    return null;
  }, [color, contentType, theme?.text]);

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
      margin: 'unset',
      ...fontSizeStyle,
      ...paddingStyle,
      ...(style ?? {}),
      backgroundColor: backgroundColor?.hex,
      color: textColor,
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

  const className = classNames('typography-text', { primary: contentType === 'primary', info: contentType === 'info' });

  if (textType === 'span') {
    return (
      <Text {...textProps} className={className}>
        {children}
      </Text>
    );
  }

  if (textType === 'paragraph') {
    return (
      <Paragraph {...paragraphProps} className={className}>
        {children}
      </Paragraph>
    );
  }

  return (
    <Title {...titleProps} className={className}>
      {children}
    </Title>
  );
};

export default TypographyComponent;
