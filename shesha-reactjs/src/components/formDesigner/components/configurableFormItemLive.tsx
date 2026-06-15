import React, { ReactNode, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules, useAvailableConstantsDataNoRefresh } from '@/providers/form/utils';
import classNames from 'classnames';
import { UnwrapCodeEvaluators, useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemContext } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { designerConstants } from '../utils/designerConstants';
import { addPx } from '@/utils/style';
import { useStyles } from './styles';

export const ConfigurableFormItemLive = <TValue = unknown>({
  children,
  model,
  valuePropName,
  initialValue,
  className,
  labelCol,
  wrapperCol,
  autoAlignLabel = true,
}: UnwrapCodeEvaluators<IConfigurableFormItemProps<TValue>>): ReactNode => {
  const shaForm = useShaFormInstance();
  const getFormData = shaForm.getPublicFormApi().getFormData;
  const formItem = useFormItem();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;
  const isInDesigner = shaForm.formMode === 'designer';
  const allData = useAvailableConstantsDataNoRefresh();
  const { styles } = useStyles({ autoAlignLabel });

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol ?? labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, labelCol, formItemWrapperCol, wrapperCol]);

  const isVertical = (model.layout ?? shaForm.settings?.layout) === 'vertical';

  const { hideLabel, hidden } = model;

  const { top: defaultMarginTop, left: defaultMarginLeft, right: defaultMarginRight, bottom: defaultMarginBottom } = designerConstants.DEFAULT_FORM_ITEM_MARGINS;

  // In designer mode: NEVER apply margins to Form.Item (wrapper handles them)
  // In live mode: Apply margins from allStyles.margins or use defaults
  // Note: margins are stored separately so inner components don't get them (prevents double margins)
  const rawMargins = isInDesigner
    ? { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }
    : (model.allStyles?.margins || {});

  const {
    marginTop = defaultMarginTop,
    marginBottom = defaultMarginBottom,
    marginRight = defaultMarginRight,
    marginLeft = defaultMarginLeft,
  } = rawMargins;

  const propName = namePrefix && !model.initialContext
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  if (hidden) return null;

  const formItemProps: FormItemProps = {
    className: classNames(className, styles.formItem),
    hidden: model.hidden ?? false,
    ...(valuePropName ? { valuePropName: valuePropName } : {}),
    initialValue: initialValue,
    tooltip: model.description || undefined,
    rules: model.hidden ? [] : getValidationRules(model, { getFormData }),
    name: model.context ? undefined : getFieldNameFromExpression(propName),
    style: {
      marginTop: addPx(marginTop, allData),
      marginBottom: addPx(marginBottom, allData),
      marginRight: addPx(marginRight, allData),
      marginLeft: addPx(marginLeft, allData),
    },
    ...(model.labelAlign ? { labelAlign: model.labelAlign } : {}),
    ...(!hideLabel ? { label: model.label } : {}),
    ...(layout.labelCol ? { labelCol: layout.labelCol } : {}),
    ...(hideLabel || isVertical ? { wrapperCol: { span: 24 } } : layout.wrapperCol ? { wrapperCol: layout.wrapperCol } : {}),
  };

  if (typeof children === 'function') {
    if (model.context) {
      return (
        <ConfigurableFormItemContext<TValue>
          componentId={model.id}
          formItemProps={formItemProps}
          valuePropName={valuePropName}
          componentName={model.componentName ?? ""}
          propertyName={propName ?? ""}
          contextName={model.context}
        >
          {children}
        </ConfigurableFormItemContext>
      );
    } else {
      return (
        <ConfigurableFormItemForm<TValue>
          formItemProps={formItemProps}
          valuePropName={valuePropName}
          componentName={model.componentName ?? ""}
          componentId={model.id}
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
