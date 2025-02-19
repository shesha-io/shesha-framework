import { LineOutlined } from '@ant-design/icons';
import {
  FormMarkup,
  IConfigurableFormComponent,
  IToolboxComponent,
  getLayoutStyle,
  useFormData,
  useGlobalState,
  validateConfigurableComponentSettings,
} from '@shesha-io/reactjs';
import { Divider, DividerProps } from 'antd';
import React from 'react';
import settingsFormJson from './settingsForm.json';

export interface IDividerProps extends IConfigurableFormComponent {
  dividerType?: 'horizontal' | 'vertical';
  dashed?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const DividerComponent: IToolboxComponent<IDividerProps> = {
  type: 'divider',
  isInput: false,
  name: 'Divider',
  icon: <LineOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const props: DividerProps = {
      type: model?.dividerType,
      dashed: model?.dashed,
    };

    return (
      <Divider style={getLayoutStyle(model, { data, globalState })} {...props} />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => ({
    dividerType: 'horizontal',
    dashed: false,
    ...model,
  }),
};

export default DividerComponent;
