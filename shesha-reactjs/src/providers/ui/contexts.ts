import { ColProps } from 'antd/lib/col';
import { FormProps } from 'antd/lib/form';
import { Gutter } from 'antd/lib/grid/row';
import { createContext } from 'react';
import { IFlagsSetters, IFlagsState } from '@/interfaces';

export type ControlSize = 'large' | 'default' | 'small';

export type IFlagProgressFlags = '' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = '' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = '' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface IUiStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
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

export interface IUiActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  setControlsSize: (size: ControlSize) => void;
  toggleModalInvisible: () => void;
  toggleRoleAppointmentVisible: (visible: boolean) => void;
  togglePersonPickerVisible: (visible: boolean) => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const UI_CONTEXT_INITIAL_STATE: IUiStateContext = {
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

export const UiStateContext = createContext<IUiStateContext>(UI_CONTEXT_INITIAL_STATE);

export const UiActionsContext = createContext<IUiActionsContext>(undefined);
