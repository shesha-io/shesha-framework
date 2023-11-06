import { ArrowsAltOutlined } from '@ant-design/icons';
import { Space, SpaceProps } from 'antd';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from 'interfaces/formDesigner';
import { FormMarkup } from 'providers/form/models';
import ComponentsContainer from '../../containers/componentsContainer';
import settingsFormJson from './settingsForm.json';

export interface ISpaceProps extends IConfigurableFormComponent {
  align?: 'start' | 'end' | 'center' | 'baseline';
  direction?: 'vertical' | 'horizontal';
  size?: 'small' | 'middle' | 'large'; // number
  wrap?: boolean;
  sizeNumber?: number;
  marginLeft?: number;
  marginRight?: number;
}

const settingsForm = settingsFormJson as FormMarkup;

const SpaceComponent: IToolboxComponent<ISpaceProps> = {
  type: 'space',
  name: 'Space',
  icon: <ArrowsAltOutlined />,
  isHidden: true,
  Factory: ({ model: passedModel }) => {
    const { marginLeft, marginRight, ...model } = passedModel;
    const props: SpaceProps = {
      align: model?.align,
      direction: model?.direction,
      size: model?.size || model?.sizeNumber,
      wrap: model?.wrap,
    };

    return (
      <ComponentsContainer
        containerId={model.id}
        direction={model?.direction}
        render={components => (
          <Space {...props} style={{ marginLeft, marginRight }}>
            {components}
          </Space>
        )}
      />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    direction: 'horizontal',
    size: 'small',
    wrap: false,
    ...model,
  }),
  migrator: (m) => m
    .add<ISpaceProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default SpaceComponent;
