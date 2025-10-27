import React, { FC, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules } from '@/providers/form/utils';
import classNames from 'classnames';
import { useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemContext } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { useStyles } from './styles';
import { addPx } from '@/utils/style';

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

  const colLayout = useMemo(() => {
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol, labelCol, wrapperCol]);

  const settings = shaForm.settings;
  const { styles } = useStyles(settings.layout);
  const defaultMargins = settings?.formItemMargin || {};
  const { top, left, right, bottom } = defaultMargins;
  const componentStyles = model?.allStyles?.fullStyle || {};

  // Apply default margins from form settings, but allow component-specific overrides
  const marginTop = componentStyles.marginTop ?? top ?? 5;
  const marginBottom = componentStyles.marginBottom ?? bottom ?? 5;
  const marginRight = componentStyles.marginRight ?? right ?? 3;
  const marginLeft = componentStyles.marginLeft ?? left ?? 3;

  // Build style object with proper units
  const formItemStyle = {
    marginBottom: addPx(marginBottom),
    marginRight: addPx(marginRight),
    marginLeft: addPx(marginLeft),
    marginTop: addPx(marginTop),
    width: addPx(componentStyles.width),
    height: addPx(componentStyles.height),
    minWidth: addPx(componentStyles.minWidth),
    minHeight: addPx(componentStyles.minHeight),
    maxWidth: addPx(componentStyles.maxWidth),
    maxHeight: addPx(componentStyles.maxHeight),
  };

  const { hideLabel, hidden } = model;
  if (hidden) return null;

  const propName = namePrefix && !model.initialContext
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  const formItemProps: FormItemProps = {
    className: classNames(className, styles.formItem, settings?.layout),
    label: hideLabel ? null : model.label,
    labelAlign: model.labelAlign,
    hidden: model.hidden,
    valuePropName: valuePropName,
    initialValue: initialValue,
    tooltip: model.description || undefined,
    rules: model.hidden ? [] : getValidationRules(model, { getFormData }),
    labelCol: colLayout?.labelCol,
    wrapperCol: hideLabel ? { span: 24 } : colLayout?.wrapperCol,
    // layout: model.layout, this property appears to have been removed from the Ant component
    name: model.context ? undefined : getFieldNameFromExpression(propName),
    style: formItemStyle,
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
