import React, { FC, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules, useAvailableConstantsData } from '@/providers/form/utils';
import classNames from 'classnames';
import { useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemContext } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { designerConstants } from '../utils/designerConstants';
import { addPx } from '@/utils/style';
import { useStyles } from './styles';

export const ConfigurableFormItemLive: FC<IConfigurableFormItemProps> = ({
  children,
  model,
  valuePropName,
  initialValue,
  className,
  labelCol,
  wrapperCol,
  autoAlignLabel = true,
}) => {
  const { getPublicFormApi } = useShaFormInstance();
  const getFormData = getPublicFormApi().getFormData;
  const formItem = useFormItem();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;
  const shaForm = useShaFormInstance();
  const isInDesigner = shaForm.formMode === 'designer';
  const allData = useAvailableConstantsData();
  const { styles } = useStyles({ autoAlignLabel, labelAlign: model.labelAlign });

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol]);

  const { hideLabel, hidden } = model;
  if (hidden) return null;

  const { top: defaultMarginTop, left: defaultMarginLeft, right: defaultMarginRight, bottom: defaultMarginBottom } = designerConstants.DEFAULT_FORM_ITEM_MARGINS;

  // In designer mode: NEVER apply margins to Form.Item (wrapper handles them)
  // In live mode: Apply margins from allStyles.margins or use defaults
  // Note: margins are stored separately so inner components don't get them (prevents double margins)
  const rawMargins = isInDesigner
    ? { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }
    : (model?.allStyles?.margins || {});

  const {
    marginTop = defaultMarginTop,
    marginBottom = defaultMarginBottom,
    marginRight = defaultMarginRight,
    marginLeft = defaultMarginLeft,
  } = rawMargins;

  const propName = namePrefix && !model.initialContext
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  const formItemProps: FormItemProps = {
    className: classNames(className, styles.formItem),
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
    style: {
      marginTop: addPx(marginTop, allData),
      marginBottom: addPx(marginBottom, allData),
      marginRight: addPx(marginRight, allData),
      marginLeft: addPx(marginLeft, allData),
    },
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
