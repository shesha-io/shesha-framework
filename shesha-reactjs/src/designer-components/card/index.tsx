import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useFormData, useGlobalState } from '@/providers';
import { useForm } from '@/providers/form';
import { getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { CodeSandboxSquareFilled } from '@ant-design/icons';
import { Card } from 'antd';
import React from 'react';
import { ICardComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

const CardComponent: IToolboxComponent<ICardComponentProps> = {
  type: 'card',
  name: 'Card',
  icon: <CodeSandboxSquareFilled />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { formMode, hasVisibleChilds } = useForm();
    const { globalState } = useGlobalState();

    const title = model.hideHeading ? null : model.label;

    const headerComponents = model?.header?.components ?? [];

    const extra =
      (headerComponents?.length > 0 || formMode === 'designer') && !model.hideHeading ? (
        <ComponentsContainer
          containerId={model.header?.id}
          direction="horizontal"
          dynamicComponents={model?.isDynamic ? headerComponents : []}
        />
      ) : null;

    if (model.hideWhenEmpty && formMode !== 'designer') {
      const childsVisible = hasVisibleChilds(model.content.id);
      if (!childsVisible) return null;
    }

    return (
      <ParentProvider model={model}>
        <Card title={title} extra={extra} style={getLayoutStyle(model, { data, globalState })}>
          <ComponentsContainer
            containerId={model?.content?.id}
            dynamicComponents={model?.isDynamic ? model?.content.components : []}
          />
        </Card>
      </ParentProvider>
    );
  },
  initModel: (model) => ({
    ...model,
    header: { id: nanoid(), components: [] },
    content: { id: nanoid(), components: [] },
  }),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  customContainerNames: ['header', 'content'],
};

export default CardComponent;
