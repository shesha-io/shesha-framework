import React, { FC } from 'react';
import { Alert } from 'antd';
import { evaluateString } from '@/providers/form/utils';
import { GenericText } from './genericText';
import { ITypographyProps } from './models';
import { useForm, useFormData } from '@/providers';
import {
  getContent,
} from './utils';
import { isMoment } from 'moment';

const TypographyComponent: FC<ITypographyProps> = ({
  contentDisplay,
  dataType,
  dateFormat,
  numberFormat,
  value,
  styles,
  textAlign,
  ...model
}) => {
  const { formMode } = useForm();
  const { data: formData } = useFormData();

  console.log('styles', styles);
  const val = typeof value === 'string'
    ? value 
    : isMoment(value)
      ? value.isValid() ? value.format(dateFormat) : ''
      : value?.toString();

  const contentEvaluation = evaluateString(val, formData);
  const content = getContent(contentEvaluation, { dataType, dateFormat, numberFormat });

  if (!content && contentDisplay === 'content' && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }


  return (
    <GenericText style={{...styles, justifyContent: textAlign, display: 'flex'}} {...model}>
      {content}
    </GenericText>
  );
};

export default TypographyComponent;