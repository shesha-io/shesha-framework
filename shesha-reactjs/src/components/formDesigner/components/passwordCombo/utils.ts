import { FormItemProps, FormProps } from 'antd';
import classNames from 'classnames';
import { getFieldNameFromExpression, getValidationRules } from '../../../../formDesignerUtils';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { IFormSettings, SILENT_KEY } from '../../../../providers/form/models';
import { getStyle } from '../../../../providers/form/utils';

export interface IFormPropOptions {
  isComponentHidden: (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic' | 'hidden'>) => boolean;
  formData: any;
}

export interface IPasswordComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  confirmDescription?: string;
  confirmPlaceholder?: string;
  confirmLabel?: string;
  hideBorder?: boolean;
  minLength?: number;
  message?: string;
}

export const confirmModel = (m: IPasswordComponentProps): IPasswordComponentProps => {
  let model = { ...m };

  model.description = m.confirmDescription;
  model.placeholder = m.confirmPlaceholder;
  model.label = m.confirmLabel;
  model.name = `${SILENT_KEY}${model.name}`;

  return model;
};

export const getConfigModel = ({ id, name, type }: IPasswordComponentProps): IPasswordComponentProps => ({
  id,
  name,
  type,
  hideLabel: true,
});

export const getDefaultModel = (m: IPasswordComponentProps) => {
  try {
    const model = { ...m };

    if (!model.confirmLabel && model.label) {
      model.confirmLabel = incrementLastChar(m.label);
    }

    return model;
  } catch (_e) {
    return m;
  }
};

export const getFormProps = (formSettings: IFormSettings): FormProps => ({
  layout: formSettings?.layout,
  labelCol: formSettings?.labelCol,
  wrapperCol: formSettings?.wrapperCol,
  colon: formSettings?.colon,
});

export const getFormItemProps = (
  model: IPasswordComponentProps,
  { formData, isComponentHidden }: IFormPropOptions
): FormItemProps => ({
  className: classNames({ 'form-item-hidden': model?.hideLabel }),
  name: getFieldNameFromExpression(model?.name),
  label: model?.hideLabel ? null : model?.label,
  labelAlign: model?.labelAlign,
  hidden: isComponentHidden(model),
  tooltip: model?.description,
  rules: isComponentHidden(model) ? [] : getValidationRules(model, { formData }),
  style: model?.hidden ? { display: 'none' } : {},
});

export const getInputProps = (model: IPasswordComponentProps, formData: any) => ({
  bordered: !model?.hideBorder,
  size: model?.size,
  disabled: model.disabled,
  readOnly: model.readOnly,
  style: getStyle(model?.style, formData),
});

export const incrementLastChar = (value: string): string => {
  try {
    if (typeof value === 'string' && value) {
      const last: string = value[value.length - 1];
      let lastNumber: number;

      if (isNaN(last as any)) return value;

      lastNumber = Number(last);
      lastNumber++;

      return `${value.substring(0, value.length - 1)}${lastNumber}`;
    }

    return value;
  } catch (_e) {
    return null;
  }
};
