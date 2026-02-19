import React, { FC, useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules } from '@/providers/form/utils';
import classNames from 'classnames';
import { useCanvas, useFormItem, useShaFormInstance } from '@/providers';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemContext } from './configurableFormItemContext';
import { ConfigurableFormItemForm } from './configurableFormItemForm';
import { useStyles } from './styles';
import { getCalculatedDimension } from '@/designer-components/_settings/utils/index';
import { designerConstants } from '../utils/designerConstants';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useValidationHeight } from './useValidationHeight';

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
  const { zoom } = useCanvas()
  const isInDesigner = shaForm.formMode === 'designer';
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  // Get canvas zoom for designer mode (defaults to 100% in live/preview mode)

  // Use custom hook to measure validation message height dynamically
  // Convert zoom percentage (e.g., 50) to scale factor (e.g., 0.5)
  const [formItemRef, validationHeight] = useValidationHeight(isInDesigner ? zoom/100 : 1);

  const colLayout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol, labelCol, wrapperCol]);
  const settings = shaForm.settings;

  // Get component definition to check if it preserves its own dimensions
  const component = getToolboxComponent(model.type);
  const preserveDimensionsInDesigner = component?.preserveDimensionsInDesigner ?? false;

  const { top: MarginTop, left: MarginLeft, right: MarginRight, bottom: MarginBottom } = designerConstants.DEFAULT_FORM_ITEM_MARGINS;

  // In designer mode: NEVER apply margins to Form.Item (wrapper handles them)
  // In live mode: Apply margins from allStyles.margins or use defaults
  // Note: margins are stored separately so inner components don't get them (prevents double margins)
  const rawMargins = isInDesigner
    ? { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }
    : (model?.allStyles?.margins || {});

  const {
    marginTop = MarginTop,
    marginBottom = MarginBottom,
    marginRight = MarginRight,
    marginLeft = MarginLeft,
  } = rawMargins;

  // Get dimension values for Form.Item wrapper
  // For components with container styles (e.g., attachmentsEditor), use container dimensions for the wrapper
  // Thumbnail/root dimensions should pass through unchanged to the component
  const containerDimensions = model?.container?.dimensions;
  const hasContainerDimensions = !!containerDimensions;

  // Use container dimensions for the Form.Item wrapper (if available)
  const {
    width: containerWidth,
    height: containerHeight,
    minWidth: containerMinWidth,
    minHeight: containerMinHeight,
    maxWidth: containerMaxWidth,
    maxHeight: containerMaxHeight,
  } = containerDimensions || {};

  // Get thumbnail/root dimensions from allStyles - these pass through unchanged to the component
  const {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = model?.allStyles?.dimensionsStyles || {};

  const formItemStyle = useMemo(() => {
    // Use container dimensions for the Form.Item wrapper (if available), otherwise use thumbnail dimensions
    const wrapperWidth = hasContainerDimensions ? containerWidth : width;
    const wrapperHeight = hasContainerDimensions ? containerHeight : height;
    const wrapperMinWidth = hasContainerDimensions ? containerMinWidth : minWidth;
    const wrapperMinHeight = hasContainerDimensions ? containerMinHeight : minHeight;
    const wrapperMaxWidth = hasContainerDimensions ? containerMaxWidth : maxWidth;
    const wrapperMaxHeight = hasContainerDimensions ? containerMaxHeight : maxHeight;

    // Handle auto width in designer mode
    // - auto width should fill remaining space (100%) in designer
    const isAutoWidth = wrapperWidth === 'auto';

    const calculatedWidth = preserveDimensionsInDesigner
      ? 'auto'
      : isInDesigner
        ? isAutoWidth
          ? '100%' // Auto width fills wrapper in designer
          : getCalculatedDimension('100%', marginLeft, marginRight)
        : getCalculatedDimension(wrapperWidth, marginLeft, marginRight);

    const calculatedHeight = preserveDimensionsInDesigner
      ? 'auto'
      : isInDesigner
        ? '100%'
        : wrapperHeight;

    // In designer mode: ONLY apply padding from stylebox, margins are handled by wrapper
    // Exception: validation height is added as marginBottom to create space for absolutely positioned validation
    // In live mode: Apply both margins and padding from stylebox, plus validation height
    return isInDesigner
      ? {
        // No margins in designer mode - wrapper handles them as padding
        // Exception: add validation height as marginBottom to create space for absolutely positioned validation element
        width: calculatedWidth,
        height: validationHeight > 0 ? `calc(${calculatedHeight} - ${validationHeight}px )` : calculatedHeight,
        minHeight: wrapperMinHeight,
        minWidth: wrapperMinWidth,
        maxHeight: wrapperMaxHeight,
        maxWidth: wrapperMaxWidth,
        // Only padding from stylebox (if any)
        paddingTop: model?.allStyles?.fullStyle?.paddingTop,
        paddingRight: model?.allStyles?.fullStyle?.paddingRight,
        paddingBottom: model?.allStyles?.fullStyle?.paddingBottom,
        paddingLeft: model?.allStyles?.fullStyle?.paddingLeft,
      }
      : {
        // Live mode: apply margins, padding, and validation height
        marginTop,
        marginBottom: validationHeight ? `calc(${marginBottom} + ${validationHeight}px)` : marginBottom,
        marginLeft,
        marginRight,
        width: calculatedWidth,
        height: calculatedHeight,
        minHeight: wrapperMinHeight,
        minWidth: wrapperMinWidth,
        maxHeight: wrapperMaxHeight,
        maxWidth: wrapperMaxWidth,
      };
  }, [isInDesigner, marginTop, marginBottom, marginLeft, marginRight, validationHeight,
    width, height, minWidth, minHeight, maxWidth, maxHeight,
    containerWidth, containerHeight, containerMinWidth, containerMinHeight, containerMaxHeight, hasContainerDimensions,
    model?.allStyles?.fullStyle]);

  const { hideLabel, hidden } = model;
  const hasLabel = !hideLabel && !!model.label;
  const { styles } = useStyles({ layout: settings?.layout, hasLabel, noLabelAutoMargin: model.noLabelAutoMargin, preserveDimensionsInDesigner });
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
  };

  if (typeof children === 'function') {
    if (model.context) {
      return (
        <div ref={formItemRef} style={formItemStyle}>
          <ConfigurableFormItemContext
            componentId={model.id}
            formItemProps={formItemProps}
            valuePropName={valuePropName}
            propertyName={propName}
            contextName={model.context}
          >
            {children}
          </ConfigurableFormItemContext>
        </div>
      );
    } else {
      return (
        <div ref={formItemRef} style={formItemStyle}>
          <ConfigurableFormItemForm
            formItemProps={formItemProps}
            valuePropName={valuePropName}
          >
            {children}
          </ConfigurableFormItemForm>
        </div>
      );
    }
  } else {
    // Use standard Form.Item for components without binding support
    return (
      <div ref={formItemRef}>
        <Form.Item {...formItemProps}>{children}</Form.Item>
      </div>
    );
  }
};
