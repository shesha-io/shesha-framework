import { ReactNode, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getAntdFormValidationRules, getFieldNameFromExpression, useAvailableConstantsDataNoRefresh } from '@/providers/form/utils';
import classNames from 'classnames';
import { UnwrapCodeEvaluators, useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemCtx } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { addPx } from '@/utils/style';
import { useStyles } from './styles';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { designerConstants } from '../utils/designerConstants';

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
  const toolboxComponent = useFormDesignerComponentGetter()(model.type);

  const shaForm = useShaFormInstance();
  const getFormData = shaForm.getPublicFormApi().getFormData;
  const formItem = useFormItem();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;
  const allData = useAvailableConstantsDataNoRefresh();
  // Pin the label to the input's configured height so a validation message cannot shift it.
  // 'auto' carries no fixed height, so fall back to the default alignment in that case.
  const { styles } = useStyles({ ...model, autoAlignLabel });

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol ?? labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, labelCol, formItemWrapperCol, wrapperCol]);

  const isVertical = (model.layout ?? shaForm.settings?.layout) === 'vertical';

  const { hideLabel, hidden } = model;

  const { top: defaultMarginTop, left: defaultMarginLeft, right: defaultMarginRight, bottom: defaultMarginBottom } = designerConstants.DEFAULT_FORM_ITEM_MARGINS;

  const {
    marginTop = defaultMarginTop,
    marginBottom = defaultMarginBottom,
    marginRight = defaultMarginRight,
    marginLeft = defaultMarginLeft,
  } = (model.stylingBoxJson || {});

  // ToDo: AS - remove after migration all components to the new styles
  const marginStyle = toolboxComponent?.allowInherit === true
    ? {}
    : {
      marginTop: addPx(marginTop, allData),
      marginBottom: addPx(marginBottom, allData),
      marginRight: addPx(marginRight, allData),
      marginLeft: addPx(marginLeft, allData),
    };

  const propName = isNotNullOrWhiteSpace(namePrefix) && isNullOrWhiteSpace(model.initialContext)
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  if (Boolean(hidden)) return null;

  const formItemProps: FormItemProps = {
    className: classNames(className, styles.formItem),
    hidden: model.hidden ?? false,
    ...(isNotNullOrWhiteSpace(valuePropName) ? { valuePropName: valuePropName } : {}),
    initialValue: initialValue,
    tooltip: isNotNullOrWhiteSpace(model.description) ? model.description : undefined,
    rules: [...getAntdFormValidationRules(model, { getFormData }), ...(toolboxComponent?.getExtraValidationRules?.(model) ?? [])],
    ...(isDefined(model.validationDependencies?.length) ? { dependencies: model.validationDependencies } : {}),
    name: isNotNullOrWhiteSpace(model.context) ? undefined : getFieldNameFromExpression(propName),
    style: marginStyle,
    ...(model.labelAlign ? { labelAlign: model.labelAlign } : {}),
    ...(!Boolean(hideLabel) ? { label: model.label } : {}),
    ...(layout.labelCol ? { labelCol: layout.labelCol } : {}),
    ...(Boolean(hideLabel) || isVertical ? { wrapperCol: { span: 24 } } : layout.wrapperCol ? { wrapperCol: layout.wrapperCol } : {}),
  };

  if (typeof children === 'function') {
    if (isNotNullOrWhiteSpace(model.context)) {
      return (
        <ConfigurableFormItemCtx<TValue>
          componentId={model.id}
          formItemProps={formItemProps}
          valuePropName={valuePropName}
          componentName={model.componentName ?? ""}
          propertyName={propName ?? ""}
          contextName={model.context}
        >
          {children}
        </ConfigurableFormItemCtx>
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
