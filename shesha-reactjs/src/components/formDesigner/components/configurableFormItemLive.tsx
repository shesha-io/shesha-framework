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
import { DEFAULT_FORM_ITEM_MARGINS } from '../utils/designerConstants';
import { shouldSkipComponent } from '../utils/componentTypeUtils';

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
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol, labelCol, wrapperCol]);
  const settings = shaForm.settings;

  const isInDesigner = shaForm.formMode === 'designer';
  const shouldSkip = shouldSkipComponent(model.type);

  const { top: MarginTop, left: MarginLeft, right: MarginRight, bottom: MarginBottom } = DEFAULT_FORM_ITEM_MARGINS;
  const {
    marginTop = isInDesigner ? 0 : MarginTop,
    marginBottom = isInDesigner ? 0 : MarginBottom,
    marginRight = isInDesigner ? 0 : MarginRight,
    marginLeft = isInDesigner ? 0 : MarginLeft,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = model?.allStyles?.fullStyle || {};

  const formItemStyle = useMemo(() => {
    // Handle auto width in designer mode
    // - auto width should fill remaining space (100%) in designer
    const isAutoWidth = width === 'auto';

    const calculatedWidth = shouldSkip
      ? 'auto'
      : isInDesigner
        ? isAutoWidth
          ? '100%' // Auto width fills wrapper in designer
          : getCalculatedDimension('100%', marginRight, marginLeft)
        : getCalculatedDimension(width, marginLeft, marginRight);

    const calculatedHeight = shouldSkip
      ? 'auto'
      : isInDesigner
        ? '100%'
        : height;

    // In designer mode: ONLY apply padding from stylebox, margins are handled by wrapper
    // In live mode: Apply both margins and padding from stylebox
    return isInDesigner
      ? {
        // No margins in designer mode - wrapper handles them as padding
        width: calculatedWidth,
        height: calculatedHeight,
        minHeight,
        minWidth,
        maxHeight,
        maxWidth,
        // Only padding from stylebox (if any)
        paddingTop: model?.allStyles?.fullStyle?.paddingTop,
        paddingRight: model?.allStyles?.fullStyle?.paddingRight,
        paddingBottom: model?.allStyles?.fullStyle?.paddingBottom,
        paddingLeft: model?.allStyles?.fullStyle?.paddingLeft,
      }
      : {
        // Live mode: apply both margins and padding
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        width: calculatedWidth,
        height: calculatedHeight,
        minHeight,
        minWidth,
        maxHeight,
        maxWidth,
        paddingTop: model?.allStyles?.fullStyle?.paddingTop,
        paddingRight: model?.allStyles?.fullStyle?.paddingRight,
        paddingBottom: model?.allStyles?.fullStyle?.paddingBottom,
        paddingLeft: model?.allStyles?.fullStyle?.paddingLeft,
      };
  }, [shouldSkip, isInDesigner, marginTop, marginBottom, marginLeft, marginRight, width, height, minHeight, minWidth, maxHeight, maxWidth, model?.allStyles?.fullStyle]);

  const { hideLabel, hidden } = model;
  const hasLabel = !hideLabel && !!model.label;
  const { styles } = useStyles({ layout: settings?.layout, hasLabel });
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
