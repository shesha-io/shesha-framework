import React, { CSSProperties, FC, useMemo } from 'react';
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
import { addPx } from '@/utils/style';

// Extract primitive padding values to prevent object reference changes from triggering re-computation
interface PaddingValues {
  paddingTop: string | number | undefined;
  paddingRight: string | number | undefined;
  paddingBottom: string | number | undefined;
  paddingLeft: string | number | undefined;
}

const usePaddingValues = (fullStyle: CSSProperties | undefined): PaddingValues => {
  return useMemo(() => ({
    paddingTop: fullStyle?.paddingTop,
    paddingRight: fullStyle?.paddingRight,
    paddingBottom: fullStyle?.paddingBottom,
    paddingLeft: fullStyle?.paddingLeft,
  }), [
    fullStyle?.paddingTop,
    fullStyle?.paddingRight,
    fullStyle?.paddingBottom,
    fullStyle?.paddingLeft,
  ]);
};

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
  const { zoom } = useCanvas();
  const isInDesigner = shaForm.formMode === 'designer';
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  // Get canvas zoom for designer mode (defaults to 100% in live/preview mode)

  // Use custom hook to measure validation message height dynamically
  // Convert zoom percentage (e.g., 50) to scale factor (e.g., 0.5)
  const [formItemRef, validationHeight] = useValidationHeight(isInDesigner ? zoom / 100 : 1);

  const colLayout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol, labelCol, wrapperCol]);
  const settings = shaForm.settings;

  // Get component definition to check if it preserves its own dimensions
  const component = getToolboxComponent(model.type);
  const preserveDimensionsInDesigner = component?.preserveDimensionsInDesigner ?? false;

  const { top: MarginTop, bottom: MarginBottom } = designerConstants.DEFAULT_FORM_ITEM_MARGINS;

  // In designer mode: NEVER apply margins to Form.Item (wrapper handles them)
  // In live mode: Apply margins from allStyles.margins or use defaults
  // Note: margins are stored separately so inner components don't get them (prevents double margins)
  const rawMargins = isInDesigner
    ? { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }
    : (model?.allStyles?.margins || {});

  const {
    marginTop = MarginTop,
    marginBottom = MarginBottom,
    marginRight,
    marginLeft,
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

  // Extract padding values using custom hook to prevent object reference changes from triggering re-computation
  const paddingValues = usePaddingValues(model?.allStyles?.fullStyle);

  const formItemStyle = useMemo(() => {
    // Step 1: Select which dimensions to use (container takes precedence over regular dimensions)
    const wrapperWidth = hasContainerDimensions ? containerWidth : width;
    const wrapperHeight = hasContainerDimensions ? containerHeight : height;
    const wrapperMinWidth = hasContainerDimensions ? containerMinWidth : minWidth;
    const wrapperMinHeight = hasContainerDimensions ? containerMinHeight : minHeight;
    const wrapperMaxWidth = hasContainerDimensions ? containerMaxWidth : maxWidth;
    const wrapperMaxHeight = hasContainerDimensions ? containerMaxHeight : maxHeight;

    // Step 2: Calculate width based on context
    let calculatedWidth: string | number | undefined;

    if (preserveDimensionsInDesigner) {
      // Component manages its own dimensions
      calculatedWidth = 'auto';
    } else if (isInDesigner) {
      // In designer: auto width fills container, otherwise calculate with margins
      const isAutoWidth = wrapperWidth === 'auto';
      calculatedWidth = isAutoWidth
        ? '100%'
        : getCalculatedDimension('100%', marginLeft, marginRight);
    } else {
      // In live mode: use wrapper width and account for margins
      calculatedWidth = wrapperWidth;
    }

    // Step 3: Calculate height based on context
    let calculatedHeight: string | number | undefined;

    if (preserveDimensionsInDesigner) {
      // Component manages its own dimensions
      calculatedHeight = 'auto';
    } else if (isInDesigner) {
      // In designer: height fills container, adjusted for validation message space
      const baseHeight = '100%';
      calculatedHeight = validationHeight > 0
        ? `calc(${baseHeight} - ${validationHeight}px)`
        : baseHeight;
    } else {
      // In live mode: use wrapper height as-is
      calculatedHeight = wrapperHeight;
    }

    // Step 4: Assemble final style object based on mode
    if (isInDesigner) {
      // Designer mode: no margins (wrapper handles them), only padding from stylebox
      return {
        width: calculatedWidth,
        height: calculatedHeight,
        minHeight: wrapperMinHeight,
        minWidth: wrapperMinWidth,
        maxHeight: wrapperMaxHeight,
        maxWidth: wrapperMaxWidth,
        paddingTop: paddingValues.paddingTop,
        paddingRight: paddingValues.paddingRight,
        paddingBottom: paddingValues.paddingBottom,
        paddingLeft: paddingValues.paddingLeft,
      };
    } else {
      // Live mode: apply margins and adjust bottom margin for validation height
      const adjustedMarginBottom = validationHeight
        ? `calc(${addPx(marginBottom || 0)} + ${validationHeight}px)`
        : marginBottom;

      return {
        marginTop,
        marginBottom: adjustedMarginBottom,
        marginLeft,
        marginRight,
        width: calculatedWidth,
        height: calculatedHeight,
        minHeight: wrapperMinHeight,
        minWidth: wrapperMinWidth,
        maxHeight: wrapperMaxHeight,
        maxWidth: wrapperMaxWidth,
      };
    }
  }, [isInDesigner, marginTop, marginBottom, marginLeft, marginRight, validationHeight,
    width, height, minWidth, minHeight, maxWidth, maxHeight, preserveDimensionsInDesigner,
    containerWidth, containerHeight, containerMaxWidth, containerMinWidth, containerMinHeight, containerMaxHeight, hasContainerDimensions,
    paddingValues]);

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
      <div ref={formItemRef} style={formItemStyle}>
        <Form.Item {...formItemProps}>{children}</Form.Item>
      </div>
    );
  }
};
