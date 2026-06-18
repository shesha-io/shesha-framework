import classNames from 'classnames';
import { FormItemProps, InputProps } from 'antd';
import { getFieldNameFromExpression, getValidationRules } from '@/formDesignerUtils';
import { getStyle } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { IStyleType, SILENT_KEY, UnwrapCodeEvaluators } from '@/providers/form/models';
import { incrementStringNumber } from '@/utils/string';

export interface IFormPropOptions {
  hidden: boolean;
  formData: object;
}

export interface IPasswordComponentProps extends IConfigurableFormComponent, IStyleType {
  placeholder?: string | undefined;
  confirmDescription?: string | undefined;
  confirmPlaceholder?: string | undefined;
  confirmLabel?: string | undefined;
  hideBorder?: boolean | undefined;
  minLength?: number | undefined;
  message?: string | undefined;
  repeatPropertyName?: string | undefined;
}
export type IPasswordComponentPropsUnwrapped = UnwrapCodeEvaluators<IPasswordComponentProps>;

export const confirmModel = (m: IPasswordComponentPropsUnwrapped): IPasswordComponentPropsUnwrapped => {
  let model = { ...m };

  model.description = m.confirmDescription;
  model.placeholder = m.confirmPlaceholder;
  model.label = m.confirmLabel;
  model.propertyName = `${SILENT_KEY}${model.propertyName}`;

  return model;
};

export const getConfigModel = ({ id, propertyName: name, type }: IPasswordComponentPropsUnwrapped): IPasswordComponentPropsUnwrapped => ({
  id,
  propertyName: name,
  type,
  hideLabel: true,
});

export const getFormItemProps = (
  model: IPasswordComponentProps,
  { formData, hidden }: IFormPropOptions,
): FormItemProps => ({
  className: classNames({ 'form-item-hidden': model.hideLabel }),
  name: getFieldNameFromExpression(model.propertyName),
  label: model.hideLabel ? null : model.label,
  ...(model.labelAlign ? { labelAlign: model.labelAlign } : {}),
  hidden: hidden,
  tooltip: model.description,
  rules: hidden ? [] : getValidationRules(model, { formData }),
  style: model.hidden ? { display: 'none' } : {},
});

export const getInputProps = (model: IPasswordComponentPropsUnwrapped, formData: object): InputProps => ({
  bordered: !model.hideBorder,
  size: model.size,
  readOnly: model.readOnly,
  style: getStyle(model.style, formData),
});

export const getDefaultModel = (model: IPasswordComponentPropsUnwrapped): IPasswordComponentPropsUnwrapped => {
  return !model.confirmLabel && model.label && typeof (model.label) === 'string'
    ? { ...model, confirmLabel: incrementStringNumber(model.label) }
    : model;
};

export const defaultStyles = (): IStyleType => {
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
