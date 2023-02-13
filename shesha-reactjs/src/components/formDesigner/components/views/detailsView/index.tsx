import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ProfileOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { evaluateString, Page } from '../../../../..';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import DetailsViewSettings, { IDetailsPageSettingsProps } from './settings';
import { IDetailsViewProps } from './models';

export interface IDetailsViewComponentProps
  extends IDetailsPageSettingsProps,
    IDetailsViewProps,
    IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const DetailsViewComponent: IToolboxComponent<IDetailsViewComponentProps> = {
  type: 'detailsView',
  name: 'Details View',
  icon: <ProfileOutlined />,
  factory: (model: IDetailsViewComponentProps) => {
    const { formMode, visibleComponentIds, formData } = useForm();

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isDesignerMode = formMode === 'designer';

    const isHidden = !isDesignerMode && (model.hidden || hiddenByCondition);

    if (isHidden) return null;

    const evaluatedTitle = evaluateString(model?.title, formData);

    const override = evaluateString(model?.statusOverride, formData);
    const color = evaluateString(model?.statusColor, formData);
    const value = evaluateString(model?.statusValue, formData);

    const evaluatedBakUrl = evaluateString(model?.backUrl || '', formData);

    return (
      <Page
        formId={model?.id}
        title={evaluatedTitle}
        toolbarItems={model?.toolbarItems}
        backUrl={evaluatedBakUrl}
        status={{
          override,
          color,
          value,
        }}
        // headerTagList={[
        //   { title: 'Some title', tag: 'Some tag' },
        //   { title: 'Another title', tag: 'another tag' },
        // ]}
      >
        <ComponentsContainer containerId={model.id} />
      </Page>
    );
  },
  // settingsFormMarkup: settingsForm,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <DetailsViewSettings
        readOnly={readOnly}
        model={(model as unknown) as IDetailsViewProps}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IDetailsViewComponentProps = {
      ...model,
    };
    return customProps;
  },
};

export default DetailsViewComponent;
