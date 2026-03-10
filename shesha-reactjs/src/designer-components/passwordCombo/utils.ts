import classNames from 'classnames';
import { FormItemProps, FormProps, InputProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules } from '@/formDesignerUtils';
import { getStyle } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { IFormSettings, IStyleType, SILENT_KEY } from '@/providers/form/models';

export interface IFormPropOptions {
  hidden: boolean;
  formData: any;
}

export interface IPasswordComponentProps extends IConfigurableFormComponent, IStyleType {
  placeholder?: string;
  confirmDescription?: string;
  confirmPlaceholder?: string;
  confirmLabel?: string;
  hideBorder?: boolean;
  minLength?: number;
  message?: string;
  repeatPropertyName?: string;
}

export const confirmModel = (m: IPasswordComponentProps): IPasswordComponentProps => {
  let model = { ...m };

  model.description = m.confirmDescription;
  model.placeholder = m.confirmPlaceholder;
  model.label = m.confirmLabel;
  model.propertyName = `${SILENT_KEY}${model.propertyName}`;

  return model;
};

export const getConfigModel = ({ id, propertyName: name, type }: IPasswordComponentProps): IPasswordComponentProps => ({
  id,
  propertyName: name,
  type,
  hideLabel: true,
});

export const getFormProps = (formSettings: IFormSettings): FormProps => ({
  layout: formSettings?.layout,
  labelCol: formSettings?.labelCol,
  wrapperCol: formSettings?.wrapperCol,
  colon: formSettings?.colon,
});

export const getFormItemProps = (
  model: IPasswordComponentProps,
  { formData, hidden }: IFormPropOptions,
): FormItemProps => ({
  className: classNames({ 'form-item-hidden': model?.hideLabel }),
  name: getFieldNameFromExpression(model?.propertyName),
  label: model?.hideLabel ? null : model?.label,
  labelAlign: model?.labelAlign,
  hidden: hidden,
  tooltip: model?.description,
  rules: hidden ? [] : getValidationRules(model, { formData }),
  style: model?.hidden ? { display: 'none' } : {},
});

export const getInputProps = (model: IPasswordComponentProps, formData: object): InputProps => ({
  bordered: !model?.hideBorder,
  size: model?.size,
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
  } catch {
    return null;
  }
};

export const getDefaultModel = (m: IPasswordComponentProps): IPasswordComponentProps => {
  try {
    const model = { ...m };

    if (!model.confirmLabel && model.label) {
      model.confirmLabel = incrementLastChar(m.label as string);
    }

    return model;
  } catch {
    return m;
  }
};

export const defaultStyles = (): any => {
  return {
    background: { type: 'color', color: '#fff' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
      selectedBorder: 'all',
      selectedCorner: 'all',
    },
    dimensions: {
      width: '100%',
      height: '32px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};
