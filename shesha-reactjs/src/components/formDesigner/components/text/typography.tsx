import React, { FC } from 'react';
import { Alert } from 'antd';
import { evaluateString, getStyle } from '@/providers/form/utils';
import { GenericText } from './genericText';
import { ITextTypographyProps } from './models';
import { useForm, useFormData } from '@/providers';
import {
  getContent,
} from './utils';

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

export default TypographyComponent;