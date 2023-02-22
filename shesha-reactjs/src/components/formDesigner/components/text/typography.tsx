import { Alert, Typography } from 'antd';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TextProps } from 'antd/lib/typography/Text';
import { TitleProps } from 'antd/lib/typography/Title';
import React, { FC } from 'react';
import { useForm, useGlobalState, useSubForm } from '../../../../providers';
import { evaluateString, executeCustomExpression, getStyle } from '../../../../providers/form/utils';
import { ITextTypographyProps, ITypographyProps } from './models';
import {
  DEFAULT_CONTENT_DISPLAY,
  DEFAULT_PADDING_SIZE,
  getContent,
  getFontSizeStyle,
  getPaddingSizeStyle,
} from './utils';

const { Paragraph, Text, Title } = Typography;

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

const TypographyComponent: FC<ITextTypographyProps> = ({
  name,
  backgroundColor,
  color,
  contentDisplay = DEFAULT_CONTENT_DISPLAY,
  contentType,
  dataType,
  dateFormat,
  fontSize,
  level,
  numberFormat,
  padding = DEFAULT_PADDING_SIZE,
  textType,
  ...model
}) => {
  const { formData, formMode } = useForm();
  const { globalState } = useGlobalState();

  // NOTE: to be replaced with a generic context implementation
  const { value: subFormData } = useSubForm(false) ?? {};

  const data = subFormData || formData;

  const sizeIdentifier = textType === 'title' ? level : fontSize;

  const fontSizeStyle = typeof sizeIdentifier === 'string' ? getFontSizeStyle(sizeIdentifier) : {};
  const paddingStyle = getPaddingSizeStyle(padding);

  const baseProps: ITypographyProps = {
    code: model?.code,
    copyable: model?.copyable,
    delete: model?.delete,
    ellipsis: model?.ellipsis,
    mark: model?.mark,
    underline: model?.underline,
    keyboard: model?.keyboard,
    italic: model?.italic,
    type: contentType !== 'custom' ? contentType : null,
    style: {
      margin: 'unset',
      ...fontSizeStyle,
      ...paddingStyle,
      ...(getStyle(model.style, data) || {}),
      backgroundColor: backgroundColor?.hex,
      color: contentType === 'custom' && color ? color.hex : null,
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

  const contentEvaluation = contentDisplay === 'name' ? formData?.[name] : evaluateString(model?.content, data);
  const content = getContent(contentEvaluation, { dataType, dateFormat, numberFormat });

  const isVisibleByCondition = executeCustomExpression(model.customVisibility, true, formData, globalState);

  if (!isVisibleByCondition && formMode !== 'designer') {
    return null;
  }

  if (!content && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }

  if (textType === 'span') {
    return <Text {...textProps}>{content}</Text>;
  }

  if (textType === 'paragraph') {
    return <Paragraph {...paragraphProps}>{content}</Paragraph>;
  }

  return <Title {...titleProps}>{content}</Title>;
};

export default TypographyComponent;
