import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IFormComponentContainer } from '../../../../providers/form/models';
import { FolderOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import ComponentsContainer from '../../componentsContainer';
import settingsFormJson from './settingsForm.json';
import React, { Fragment } from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useGlobalState, useSheshaApplication } from '../../../../providers';
import { nanoid } from 'nanoid/non-secure';
import TabSettings from './settings';
import { ITabsComponentProps } from './models';
import ShaIcon from '../../../shaIcon';
import moment from 'moment';

const { TabPane } = Tabs;

const settingsForm = settingsFormJson as FormMarkup;

const TabsComponent: IToolboxComponent<ITabsComponentProps> = {
  type: 'tabs',
  name: 'Tabs',
  icon: <FolderOutlined />,
  factory: model => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const { isComponentHidden, formMode, formData } = useForm();
    const { globalState } = useGlobalState();

    const { tabs, defaultActiveKey, tabType = 'card', size, position = 'top' } = model as ITabsComponentProps;

    if (isComponentHidden(model)) return null;

    const actionKey = defaultActiveKey || (tabs?.length && tabs[0]?.key);

    const executeExpression = (expression: string, returnBoolean = true) => {
      if (!expression) {
        if (returnBoolean) {
          return true;
        } else {
          console.error('Expected expression to be defined but it was found to be empty.');

          return false;
        }
      }

      /* tslint:disable:function-constructor */
      const evaluated = new Function('data, formMode, globalState, moment', expression)(
        formData,
        formMode,
        globalState,
        moment
      );

      // tslint:disable-next-line:function-constructor
      return typeof evaluated === 'boolean' ? evaluated : true;
    };

    return (
      <Tabs defaultActiveKey={actionKey} size={size} type={tabType} tabPosition={position}>
        {tabs?.map(
          ({
            id,
            key,
            title,
            icon,
            closable,
            className,
            forceRender,
            animated,
            destroyInactiveTabPane,
            closeIcon,
            permissions,
            customVisibility,
            customEnabled,
            components,
          }) => {
            const granted = anyOfPermissionsGranted(permissions || []);

            const isVisibleByCondition = executeExpression(customVisibility, true);

            const isDisabledByCondition = !executeExpression(customEnabled, true) && formMode !== 'designer';

            if ((!granted || !isVisibleByCondition) && formMode !== 'designer') return null;

            return (
              <TabPane
                key={key}
                closable={closable}
                className={className}
                forceRender={forceRender}
                animated={animated}
                destroyInactiveTabPane={destroyInactiveTabPane}
                closeIcon={closeIcon ? <ShaIcon iconName={closeIcon as any} /> : null}
                disabled={isDisabledByCondition}
                tab={
                  icon ? (
                    <Fragment>
                      <ShaIcon iconName={icon as any} /> {title}
                    </Fragment>
                  ) : (
                    <Fragment>
                      {icon} {title}
                    </Fragment>
                  )
                }
              >
                <ComponentsContainer
                  containerId={id}
                  dynamicComponents={
                    model?.isDynamic ? components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []
                  }
                />
              </TabPane>
            );
          }
        )}
      </Tabs>
    );
  },
  initModel: model => {
    const tabsModel: ITabsComponentProps = {
      ...model,
      name: 'custom Name',
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [], itemType: 'item' }],
    };
    return tabsModel;
  },
  // settingsFormMarkup: settingsForm,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TabSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  customContainerNames: ['tabs'],
  getContainers: model => {
    const { tabs } = model as ITabsComponentProps;
    return tabs.map<IFormComponentContainer>(t => ({ id: t.id }));
  },
};

export default TabsComponent;
