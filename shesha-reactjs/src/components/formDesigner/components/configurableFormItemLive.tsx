import React, { FC, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules } from '@/providers/form/utils';
import classNames from 'classnames';
import { useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemContext } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { useStyles } from './styles';
import { getCalculatedDimension } from '@/designer-components/_settings/utils/index';

const componentsToSkip = ['attachmentsEditor', 'checkbox'];

export const ConfigurableFormItemLive: FC<IConfigurableFormItemProps> = ({
  children,
  model,
  valuePropName,
  initialValue,
  className,
  labelCol,
  wrapperCol,
}) => {
  const { getPublicFormApi } = useShaFormInstance();
  const getFormData = getPublicFormApi().getFormData;
  const formItem = useFormItem();
  const shaForm = useShaFormInstance();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol]);
  const settings = shaForm.settings;

  const isInDesigner = shaForm.formMode === 'designer';
  const defaultMargins = settings?.formItemMargin || { top: '5px', bottom: '5px', left: '3px', right: '3px' };
  const { top, left, right, bottom } = defaultMargins;
  const {
    marginTop = isInDesigner ? 0 : top,
    marginBottom = isInDesigner ? 0 : bottom,
    marginRight = isInDesigner ? 0 : right,
    marginLeft = isInDesigner ? 0 : left,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = model?.allStyles?.fullStyle || {};

  const { hideLabel, hidden } = model;
  const hasLabel = !hideLabel && !!model.label;
  const { styles } = useStyles({ layout: settings.layout, hasLabel });
  if (hidden) return null;

  const shouldSkip = componentsToSkip.includes(model.type);

  const propName = namePrefix && !model.initialContext
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  const formItemProps: FormItemProps = {
    className: classNames(className, styles.formItem, settings.layout),
    label: hideLabel ? null : model.label,
    labelAlign: model.labelAlign,
    hidden: model.hidden,
    valuePropName: valuePropName,
    initialValue: initialValue,
    tooltip: model.description || undefined,
    rules: model.hidden ? [] : getValidationRules(model, { getFormData }),
    labelCol: layout?.labelCol,
    wrapperCol: hideLabel ? { span: 24 } : layout?.wrapperCol,
    // layout: model.layout, this property appears to have been removed from the Ant component
    name: model.context ? undefined : getFieldNameFromExpression(propName),
    style: { marginBottom, marginRight, marginLeft, marginTop,
      width: shouldSkip ? 'auto' : isInDesigner ? getCalculatedDimension('100%', marginRight, marginLeft)
        : getCalculatedDimension(width, marginLeft, marginRight),
      height: shouldSkip ? 'auto' : isInDesigner
        ? '100%'
        : height, minHeight, minWidth, maxHeight: maxHeight, maxWidth },
  };

  if (typeof children === 'function') {
    if (model.context) {
      return (
        <ConfigurableFormItemContext
          componentId={model.id}
          formItemProps={formItemProps}
          valuePropName={valuePropName}
          propertyName={propName}
          contextName={model.context}
        >
          {children}
        </ConfigurableFormItemContext>
      );
    } else {
      return (
        <ConfigurableFormItemForm
          formItemProps={formItemProps}
          valuePropName={valuePropName}
        >
          {children}
        </ConfigurableFormItemForm>
      );
    }
  } else {
    // Use standard Form.Item for components without binding support
    return (
      <Form.Item {...formItemProps}>{children}</Form.Item>
    );
  }
};
