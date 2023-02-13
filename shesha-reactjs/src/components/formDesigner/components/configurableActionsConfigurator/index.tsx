import React, { FC, ReactNode, useMemo } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Collapse, Form, Switch, TreeSelect } from 'antd';
import { useForm } from '../../../../providers';
import { useConfigurableActionDispatcher } from '../../../../providers/configurableActionsDispatcher';
import { validateConfigurableComponentSettings } from '../../../..';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { IConfigurableActionConfiguration } from '../../../../interfaces/configurableAction';
import { IConfigurableActionGroupDictionary } from '../../../../providers/configurableActionsDispatcher/models';
import ActionArgumentsEditor from './actionArgumensEditor';
import HelpTextPopover from '../../../helpTextPopover';

export interface IConfigurableActionNamesComponentProps extends IConfigurableFormComponent {

}

const { Panel } = Collapse;

const ConfigurableActionConfiguratorComponent: IToolboxComponent<IConfigurableActionNamesComponentProps> = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isHidden: true,
  factory: (model: IConfigurableActionNamesComponentProps) => {
    const { isComponentHidden, formMode } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <Form.Item name={model.name} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator editorConfig={model} level={1} readOnly={formMode === 'readonly'} />
      </Form.Item>
    );
  },
  settingsFormMarkup: configurableActionsConfiguratorSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(configurableActionsConfiguratorSettingsForm, model),
};

interface IConfigurableActionConfiguratorProps {
  editorConfig: IConfigurableActionNamesComponentProps;
  value?: IConfigurableActionConfiguration;
  onChange?: (value: IConfigurableActionConfiguration) => void;
  level: number;
  readOnly?: boolean;
}

interface IActionFormModel extends Omit<IConfigurableActionConfiguration, 'actionOwner' | 'actionName'> {
  actionFullName: string;
}

const getActionFullName = (actionOwner: string, actionName: string): string => {
  return actionName
    ? `${actionOwner}:${actionName}`
    : null;
}
interface IActionIdentifier {
  actionName: string;
  actionOwner: string;
}
const parseActionFullName = (fullName: string): IActionIdentifier => {
  const parts = fullName?.split(':') ?? [];
  return parts && parts.length === 2
    ? { actionOwner: parts[0], actionName: parts[1] }
    : null;
}

const ConfigurableActionConfigurator: FC<IConfigurableActionConfiguratorProps> = props => {
  const [form] = Form.useForm();
  const { formSettings } = useForm();
  const { value, onChange, readOnly = false } = props;
  const { getActions, getConfigurableActionOrNull } = useConfigurableActionDispatcher();
  const actions = getActions();

  const formValues = useMemo<IActionFormModel>(() => {
    if (!value)
      return null;

    const { actionName, actionOwner, ...restProps } = value;
    const result: IActionFormModel = {
      ...restProps,
      actionFullName: getActionFullName(actionOwner, actionName)
    };
    return result;
  }, [value]);
  const onValuesChange = (_value, values) => {
    if (onChange) {
      const { actionFullName, ...restProps } = values;
      const actionId = parseActionFullName(actionFullName);

      const formValues = {
        actionName: actionId?.actionName,
        actionOwner: actionId?.actionOwner,
        ...restProps,
      };

      onChange(formValues);
    }
  }

  const { actionName, actionOwner } = value ?? {};
  const selectedAction = useMemo(() => {
    return actionName
      ? getConfigurableActionOrNull({ owner: actionOwner, name: actionName })
      : null;
  }, [actionName, actionOwner]);

  return (
    <div
      style={ props.level > 1 ? { paddingLeft: 10 } : {}} className="sha-action-props"
    >
      <Form
        form={form}
        layout='vertical'
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        colon={formSettings.colon}
        onValuesChange={onValuesChange}
        initialValues={formValues}
      >
        <Form.Item name="actionFullName" label="Action Name">
          <ActionSelect actions={actions} readOnly={readOnly}></ActionSelect>
        </Form.Item>
        {selectedAction && selectedAction.hasArguments && (
          <Form.Item name="actionArguments" label={null}>
            <ActionArgumentsEditor action={selectedAction} readOnly={readOnly}></ActionArgumentsEditor>
          </Form.Item>
        )}
        <Form.Item name="handleSuccess" label="Handle Success" valuePropName='checked'>
          <Switch disabled={readOnly} />
        </Form.Item >
        {
          value?.handleSuccess && (
            <Collapse defaultActiveKey={['1']}>
              <Panel header="On Success handler" key="1">
                <Form.Item name="onSuccess">
                  <ConfigurableActionConfigurator editorConfig={props.editorConfig} level={props.level + 1} readOnly={readOnly} />
                </Form.Item >
              </Panel>
            </Collapse>
          )
        }
        <Form.Item name="handleFail" label="Handle Fail" valuePropName='checked'>
          <Switch disabled={readOnly} />
        </Form.Item>
        {
          value?.handleFail && (
            <Collapse defaultActiveKey={['1']}>
              <Panel header="On Fail handler" key="1">
                <Form.Item name="onFail">
                  <ConfigurableActionConfigurator editorConfig={props.editorConfig} level={props.level + 1} readOnly={readOnly} />
                </Form.Item>
              </Panel>
            </Collapse>
          )
        }
      </Form >
    </div>
  );
};

const getConfigurableActionFullName = (owner: string, name: string) => {
  return owner
    ? `${owner}:${name}`
    : name;
}

interface IActionSelectProps {
  actions: IConfigurableActionGroupDictionary;
  value?: string;
  onChange?: () => void;
  readOnly?: boolean;
}
interface IActionSelectItem {
  title: string | ReactNode;
  value: string;
  displayText: string;
  children: IActionSelectItem[];
  selectable: boolean;
}
const ActionSelect: FC<IActionSelectProps> = ({ value, onChange, actions, readOnly = false }) => {

  const treeData = useMemo<IActionSelectItem[]>(() => {
    const result: IActionSelectItem[] = [];
    
    //console.log('build actions', actions)

    for (const owner in actions) {
      const ownerActions = actions[owner];
      const ownerNodes: IActionSelectItem[] = [];
      ownerActions.actions.forEach(action => {
        ownerNodes.push({
          title: (
            <div>
              <HelpTextPopover content={action.description}>
                {action.name}
              </HelpTextPopover>
            </div>
          ),
          displayText: `${ownerActions.ownerName}: ${action.name}`,
          value: getConfigurableActionFullName(owner, action.name),
          children: null,
          selectable: true,
        });
      });

      result.push({
        title: ownerActions.ownerName,
        value: owner,
        displayText: owner,
        children: ownerNodes,
        selectable: false,
      });
    }
    return result;
  }, [actions]);

  return (
    <TreeSelect
      disabled={readOnly}
      showSearch
      style={{
        width: '100%',
      }}
      value={value}
      dropdownStyle={{
        maxHeight: 400,
        overflow: 'auto',
      }}
      placeholder="Please select"
      allowClear
      //treeDefaultExpandAll
      onChange={onChange}
      treeNodeLabelProp='displayText'
      treeData={treeData}
    >
    </TreeSelect>
  );
}

export default ConfigurableActionConfiguratorComponent;
