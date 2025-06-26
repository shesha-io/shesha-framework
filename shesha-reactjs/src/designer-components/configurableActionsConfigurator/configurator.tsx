import React, { FC, useMemo } from 'react';
import { Collapse, Form } from 'antd';
import { useForm, useConfigurableActionDispatcher } from '@/providers';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { ActionArgumentsEditor } from './actionArgumensEditor';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { ActionSelect } from './actionSelect';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { StyledLabel } from '../_settings/utils';
import { SettingInput } from '../settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';
import FormItem from '../_settings/components/formItem';

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

const FORM_ARGUMENTS_FIELD = 'actionArguments';
const ACTION_FULL_NAME_FIELD = 'actionFullName';

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

  const hasChangedAction = (changedValues): boolean => {
    if (changedValues && changedValues.hasOwnProperty(ACTION_FULL_NAME_FIELD)) {
      const { actionFullName } = changedValues;
      const prevActionFullName = formValues?.actionFullName;
      return prevActionFullName !== actionFullName;
    }
    return false;
  };

  const onValuesChange = (changedValues, values) => {
    const actionChanged = hasChangedAction(changedValues);
    if (actionChanged) {
      form.setFieldValue(FORM_ARGUMENTS_FIELD, undefined);
    }

    if (onChange) {
      const { actionFullName, actionArguments, ...restProps } = values;
      const actionId = parseActionFullName(actionFullName);

      const newFormValues = {
        _type: StandardNodeTypes.ConfigurableActionConfig,
        actionName: actionId?.actionName,
        actionOwner: actionId?.actionOwner,
        actionArguments: actionChanged ? undefined : actionArguments,
        ...restProps,
      };

      onChange(newFormValues);
    }
  };

  const { actionName, actionOwner } = value ?? {};
  const selectedAction = useMemo(() => {
    return actionName
      ? getConfigurableActionOrNull({ owner: actionOwner, name: actionName })
      : null;
  }, [actionName, actionOwner]);

  const filteredActions = props?.allowedActions?.reduce((acc, key) => {
    if (actions[key]) {
      acc[key] = actions[key];
    }
    return acc;
  }, {});

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
        <FormItem name={ACTION_FULL_NAME_FIELD} label={label} tooltip={description} hideLabel={props.hideLabel}>
          <ActionSelect actions={props.allowedActions && props.allowedActions.length > 0 ? filteredActions : actions} readOnly={readOnly}></ActionSelect>
        </FormItem>
        {selectedAction && selectedAction.hasArguments && (
          <SourceFilesFolderProvider folder={`action-${props.level}`}>
            <Form.Item name={FORM_ARGUMENTS_FIELD} label={null}>
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
            <SettingInput propertyName='handleSuccess' label='Handle Success' type='switch' id={nanoid()} />
            {
              value?.handleSuccess && (
                <Collapse defaultActiveKey={['1']}>
                  <Panel header={<StyledLabel label="On Success Handler" />} key="1">
                    <Form.Item name="onSuccess">
                      <ConfigurableActionConfigurator editorConfig={props.editorConfig} level={props.level + 1} readOnly={readOnly} />
                    </Form.Item >
                  </Panel>
                </Collapse>
              )
            }
            <SettingInput propertyName='handleFail' label='Handle Fail' type='switch' id={nanoid()} />
            {
              value?.handleFail && (
                <Collapse defaultActiveKey={['1']}>
                  <Panel header={<StyledLabel label="On Fail Handler" />} key="1">
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
  label?: string;
  hideLabel?: boolean;
  description?: string;
  editorConfig: IConfigurableActionConfiguratorComponentProps;
  value?: IConfigurableActionConfiguration;
  onChange?: (value: IConfigurableActionConfiguration) => void;
  level: number;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
  allowedActions?: string[];
}

interface IActionFormModel extends Omit<IConfigurableActionConfiguration, 'actionOwner' | 'actionName'> {
  actionFullName: string;
}