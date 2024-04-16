import React, { FC, useMemo } from 'react';
import { Collapse, Form, Switch } from 'antd';
import { useForm, useConfigurableActionDispatcher } from '@/providers';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import ActionArgumentsEditor from './actionArgumensEditor';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { ActionSelect } from './actionSelect';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';

const { Panel } = Collapse;

const getActionFullName = (actionOwner: string, actionName: string): string => {
  return actionName
    ? `${actionOwner}:${actionName}`
    : null;
};

interface IActionIdentifier {
  actionName: string;
  actionOwner: string;
}
const parseActionFullName = (fullName: string): IActionIdentifier => {
  const parts = fullName?.split(':') ?? [];
  return parts && parts.length === 2
    ? { actionOwner: parts[0], actionName: parts[1] }
    : null;
};

export const ConfigurableActionConfigurator: FC<IConfigurableActionConfiguratorProps> = props => {
  const [form] = Form.useForm();
  const { formSettings } = useForm();
  const { value, onChange, readOnly = false, label = 'Action Name', description } = props;

  const { getActions, getConfigurableActionOrNull } = useConfigurableActionDispatcher();
  const actions = getActions();

  const availableConstants = useAvailableStandardConstantsMetadata();

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
        _type: StandardNodeTypes.ConfigurableActionConfig,
        actionName: actionId?.actionName,
        actionOwner: actionId?.actionOwner,
        ...restProps,
      };

      onChange(formValues);
    }
  };

  const { actionName, actionOwner } = value ?? {};
  const selectedAction = useMemo(() => {
    return actionName
      ? getConfigurableActionOrNull({ owner: actionOwner, name: actionName })
      : null;
  }, [actionName, actionOwner]);

  return (
    <div
      style={props.level > 1 ? { paddingLeft: 10 } : {}} className="sha-action-props"
    >
      <Form
        component={false}
        form={form}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        colon={formSettings.colon}
        onValuesChange={onValuesChange}
        initialValues={formValues}
      >
        <Form.Item name="actionFullName" label={label} tooltip={description}>
          <ActionSelect actions={actions} readOnly={readOnly}></ActionSelect>
        </Form.Item>
        {selectedAction && selectedAction.hasArguments && (
          <SourceFilesFolderProvider folder={`action-${props.level}`}>
            <Form.Item name="actionArguments" label={null}>
              <ActionArgumentsEditor
                action={selectedAction}
                readOnly={readOnly}
                exposedVariables={props.exposedVariables}
                availableConstants={availableConstants}
              />
            </Form.Item>
          </SourceFilesFolderProvider>
        )}
        {selectedAction && (
          <>
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
          </>
        )}
      </Form >
    </div>
  );
};

interface IConfigurableActionConfiguratorProps {
  label?: React.ReactNode;
  description?: string;
  editorConfig: IConfigurableActionConfiguratorComponentProps;
  value?: IConfigurableActionConfiguration;
  onChange?: (value: IConfigurableActionConfiguration) => void;
  level: number;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
}

interface IActionFormModel extends Omit<IConfigurableActionConfiguration, 'actionOwner' | 'actionName'> {
  actionFullName: string;
}