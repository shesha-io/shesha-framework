import { ColProps, FormProps } from "antd";
import { Gutter } from "antd/lib/grid/row";

export type ControlSize = 'large' | 'default' | 'small';

export interface IUiStateContext {
  readonly size?: ControlSize;
  readonly gutter?: Gutter | [Gutter, Gutter];
  readonly formItemLayout?: FormProps;
  readonly rowStyle?: React.CSSProperties;
  readonly topRowStyle?: React.CSSProperties;
  readonly modalFormItemLayout?: FormProps;
  readonly dateFormat?: string;
  readonly monthFormat?: string;
  readonly accountFormCols?: ColProps;
  readonly isRoleAppointmentVisible?: boolean;
  readonly isPersonPickerVisible?: boolean;
  readonly useColonByDefault?: boolean;
}

const UI_CONTEXT_INITIAL_STATE: IUiStateContext = {
  size: 'default',
  useColonByDefault: false,
  formItemLayout: {
    labelCol: {
      xs: { span: 24 },
      md: { span: 8 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      md: { span: 16 },
      sm: { span: 16 },
    },
  },
  modalFormItemLayout: {
    labelCol: {
      xs: { span: 24 },
      md: { span: 12 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      md: { span: 12 },
      sm: { span: 16 },
    },
  },
  dateFormat: 'DD-MM-YYYY',
  monthFormat: 'MM-YYYY',
  accountFormCols: {
    xs: { span: 14, offset: 5 },
    sm: { span: 12, offset: 6 },
    md: { span: 10, offset: 7 },
    lg: { span: 8, offset: 8 },
    xl: { span: 6, offset: 9 },
    xxl: { span: 4.5, offset: 10.5 },
  },
  rowStyle: { marginTop: '12px', marginBottom: '12px' },
  topRowStyle: { marginTop: 0 },
  isRoleAppointmentVisible: false,
  isPersonPickerVisible: false,
  gutter: [12, 12],
};

/** @deprecated will be removed in next major release*/
export const useUi = (): IUiStateContext => {
  return UI_CONTEXT_INITIAL_STATE;
};
