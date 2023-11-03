import { GroupOutlined } from '@ant-design/icons';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { nanoid } from 'nanoid';
import React from 'react';
import ComponentsContainer from '../../components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel } from '../../components/panel';
import { IToolboxComponent } from '../../interfaces';
import { useForm } from '../../providers/form';
import { FormMarkup } from '../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../providers/form/utils';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions } from '../../designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const CollapsiblePanelComponent: IToolboxComponent<ICollapsiblePanelComponentProps> = {
  type: 'collapsiblePanel',
  name: 'Panel',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { formMode, hasVisibleChilds } = useForm();
    const { label, expandIconPosition, collapsedByDefault, collapsible, ghost } = model;

    if (model.hidden) return null;

    if (model.hideWhenEmpty && formMode !== 'designer') {
      const childsVisible = hasVisibleChilds(model.content.id);
      if (!childsVisible) return null;
    }

    const headerComponents = model?.header?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) ?? [];
    const extra = headerComponents?.length > 0 || formMode === 'designer'
      ? <ComponentsContainer containerId={model.header?.id} direction='horizontal' dynamicComponents={model?.isDynamic ? headerComponents : []} />
      : null;

    return (
      <CollapsiblePanel
        header={label}
        expandIconPosition={expandIconPosition !== 'hide' ? (expandIconPosition as ExpandIconPosition) : 'start'}
        collapsedByDefault={collapsedByDefault}
        extra={extra}
        collapsible={collapsible === 'header' ? 'header' : 'icon'}
        showArrow={collapsible !== 'disabled' && expandIconPosition !== 'hide'}
        ghost={ghost}
      >
        <ComponentsContainer
          containerId={model.content.id}
          dynamicComponents={
            model?.isDynamic ? model?.content.components?.map((c) => ({ ...c, readOnly: model?.readOnly })) : []
          }
        />
      </CollapsiblePanel>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m
    .add<ICollapsiblePanelComponentPropsV0>(0, prev => {
      return {
        ...prev,
        expandIconPosition: 'right',
      };
    })
    .add<ICollapsiblePanelComponentProps>(1, (prev, struct) => {
      const header = { id: nanoid(), components: [] };
      const content = { id: nanoid(), components: [] };

      delete (struct.flatStructure.componentRelations[struct.componentId]);
      struct.flatStructure.componentRelations[content.id] = [];
      content.components = prev.components?.map(x => {
        struct.flatStructure.allComponents[x.id].parentId = content.id;
        struct.flatStructure.componentRelations[content.id].push(x.id);
        return { ...x, parentId: content.id };
      }) ?? [];

      return {
        ...prev,
        components: undefined,
        header,
        content,
        collapsible: 'icon'
      };
    })
    .add<ICollapsiblePanelComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  customContainerNames: ['header', 'content'],
};

export default CollapsiblePanelComponent;
