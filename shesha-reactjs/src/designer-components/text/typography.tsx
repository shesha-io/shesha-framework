import React, { FC } from 'react';
import { Alert } from 'antd';
import { evaluateString } from '@/providers/form/utils';
import { GenericText } from './genericText';
import { ITextTypographyProps } from './models';
import { useForm, useFormData } from '@/providers';
import {
  getContent,
} from './utils';
import { isMoment } from 'moment';

const TypographyComponent: FC<ITextTypographyProps> = ({
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

  let val: string | undefined;
  if (typeof value === 'string') {
    val = value;
  } else if (isMoment(value)) {
    val = value.isValid() ? value.format(dateFormat) : '';
  } else {
    val = value?.toString();
  }

  const contentEvaluation = evaluateString(val, formData);
  const content = getContent(contentEvaluation, { dataType, dateFormat, numberFormat });

  if (!content && contentDisplay === 'content' && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }

  return (
    <GenericText {...model} style={{ ...styles, justifyContent: textAlign, display: 'flex' }}>
      {content}
    </GenericText>
  );
};

export default TypographyComponent;
