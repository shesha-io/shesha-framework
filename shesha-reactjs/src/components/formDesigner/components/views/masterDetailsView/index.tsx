import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ProfileOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import { Page } from '../../../..';
import ConditionalWrap from '../../../../conditionalWrapper';

export interface IMasterDetailsViewProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const MasterDetailsViewComponent: IToolboxComponent<IMasterDetailsViewProps> = {
  type: 'masterDetailsView',
  name: 'Master Details View',
  icon: <ProfileOutlined />,
  factory: (model: IMasterDetailsViewProps) => {
    const { formMode, visibleComponentIds } = useForm()
    ;

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isDesignerMode = formMode === 'designer';

    const isHidden = !isDesignerMode && (model.hidden || hiddenByCondition);

    if (isHidden) return null;

    return (
      <ConditionalWrap condition={!isDesignerMode} wrap={children => <Page>{children}</Page>}>
        <ComponentsContainer containerId={model.id} />
      </ConditionalWrap>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IMasterDetailsViewProps = {
      ...model,
    };
    return customProps;
  },
};

export default MasterDetailsViewComponent;
