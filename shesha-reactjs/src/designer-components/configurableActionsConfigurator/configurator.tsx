import { IConfigurableActionConfiguration, IConfigurableActionDescriptor } from '@/interfaces/configurableAction';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { useConfigurableActionDispatcher, useForm } from '@/providers';
import { IConfigurableActionGroupDictionary } from '@/providers/configurableActionsDispatcher/models';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { arrayHasAtLeastNDefined } from '@/utils/array';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/hooks';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { nanoid } from '@/utils/uuid';
import { Collapse, Form } from 'antd';
import React, { FC, ReactNode, useMemo } from 'react';
import FormItem from '../_settings/components/formItem';
import { StyledLabel } from '../_settings/utils/utils';
import { SettingInput } from '../settingsInput/settingsInput';
import { ActionArgumentsEditor } from './actionArgumensEditor';
import { ActionSelect } from './actionSelect';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';

const { Panel } = Collapse;

const getActionFullName = (actionOwner: string, actionName: string | undefined): string | null => {
  return actionName
    ? `${actionOwner}:${actionName}`
    : null;
};

interface IActionIdentifier {
  actionName: string;
  actionOwner: string;
}
const parseActionFullName = (fullName: string | null): IActionIdentifier | null => {
  const parts = !isNullOrWhiteSpace(fullName) ? fullName.split(':') : [];
  return arrayHasAtLeastNDefined(parts, 2)
    ? { actionOwner: parts[0], actionName: parts[1] } satisfies IActionIdentifier
    : null;
};

const FORM_ARGUMENTS_FIELD = 'actionArguments';
const ACTION_FULL_NAME_FIELD = 'actionFullName';

export const ConfigurableActionConfigurator: FC<IConfigurableActionConfiguratorProps> = (props) => {
  const [form] = Form.useForm();
  const { formSettings } = useForm();
  const { value, onChange, readOnly = false, label = 'Action Name', description } = props;

  const { getActions, getConfigurableActionOrNull } = useConfigurableActionDispatcher();
  const actions = getActions();

  const availableConstants = useAvailableStandardConstantsMetadata();

  const formValues = useMemo<IActionFormModel | null>(() => {
    if (!value)
      return null;

    const { actionName, actionOwner, ...restProps } = value;
    const result: IActionFormModel = {
      ...restProps,
      actionFullName: getActionFullName(actionOwner, actionName),
    };
    return result;
  }, [value]);

  const hasChangedAction = (changedValues: Partial<IActionFormModel>): boolean => {
    if (isDefined(changedValues) && changedValues.hasOwnProperty(ACTION_FULL_NAME_FIELD)) {
      const { actionFullName } = changedValues;
      const prevActionFullName = formValues?.actionFullName;
      return prevActionFullName !== actionFullName;
    }
    return false;
  };

  const onValuesChange = (changedValues: Partial<IActionFormModel>, values: IActionFormModel): void => {
    const actionChanged = hasChangedAction(changedValues);
    if (actionChanged) {
      form.setFieldValue(FORM_ARGUMENTS_FIELD, undefined);
    }

    if (onChange) {
      const { actionFullName, actionArguments, ...restProps } = values;
      const actionId = parseActionFullName(actionFullName);

      const newFormValues: IConfigurableActionConfiguration = {
        actionName: actionId?.actionName ?? "",
        actionOwner: actionId?.actionOwner ?? "",
        actionArguments: actionChanged ? undefined : actionArguments,
        ...restProps,
        _type: StandardNodeTypes.ConfigurableActionConfig,
      };

      onChange(newFormValues);
    }
  };

  const { actionName, actionOwner } = value ?? {};
  const selectedAction = useMemo<IConfigurableActionDescriptor | null>(() => {
    return actionName && actionOwner
      ? getConfigurableActionOrNull({ owner: actionOwner, name: actionName })
      : null;
  }, [actionName, actionOwner, getConfigurableActionOrNull]);

  const availableActions = useMemo<IConfigurableActionGroupDictionary>(() => {
    if (!props.allowedActions)
      return actions;

    const result: IConfigurableActionGroupDictionary = {};
    for (const action in actions) {
      if (actions.hasOwnProperty(action) && actions[action] && props.allowedActions.includes(action)) {
        result[action] = actions[action];
      }
    }
    return result;
  }, [actions, props.allowedActions]);

  return (
    <div
      style={props.level > 1 ? { paddingLeft: 10 } : {}}
      className="sha-action-props"
    >
      <Form<IActionFormModel>
        component={false}
        form={form}
        {...(formSettings ? { layout: formSettings.layout, colon: formSettings.colon } : {})}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={onValuesChange}
        {...(formValues ? { initialValues: formValues } : {})}
      >
        {props.level === 0 ? (
          <Form.Item name={ACTION_FULL_NAME_FIELD}>
            <ActionSelect actions={availableActions} readOnly={readOnly}></ActionSelect>
          </Form.Item>
        ) : (
          <FormItem name={ACTION_FULL_NAME_FIELD} label={label} tooltip={description} hideLabel={props.hideLabel}>
            <ActionSelect actions={availableActions} readOnly={readOnly}></ActionSelect>
          </FormItem>
        )}
        {selectedAction && selectedAction.hasArguments && (
          <SourceFilesFolderProvider folder={`action-${props.level}`}>
            <Form.Item name={FORM_ARGUMENTS_FIELD} label={null}>
              <ActionArgumentsEditor
                action={selectedAction}
                readOnly={readOnly}
                availableConstants={availableConstants}
              />
            </Form.Item>
          </SourceFilesFolderProvider>
        )}
        {selectedAction && (
          <>
            <SettingInput propertyName="handleSuccess" label="Handle Success" type="switch" id={nanoid()} />
            {
              value?.handleSuccess && (
                <Collapse defaultActiveKey={['1']}>
                  <Panel header={<StyledLabel label="On Success Handler" />} key="1">
                    <Form.Item name="onSuccess">
                      <ConfigurableActionConfigurator editorConfig={props.editorConfig} level={props.level + 1} readOnly={readOnly} />
                    </Form.Item>
                  </Panel>
                </Collapse>
              )
            }
            <SettingInput propertyName="handleFail" label="Handle Fail" type="switch" id={nanoid()} />
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
      </Form>
    </div>
  );
};

interface IConfigurableActionConfiguratorProps {
  label?: string | ReactNode;
  hideLabel?: boolean | undefined;
  description?: string | undefined;
  editorConfig: IConfigurableActionConfiguratorComponentProps | undefined;
  value?: IConfigurableActionConfiguration | undefined;
  onChange?: ((value: IConfigurableActionConfiguration) => void) | undefined;
  level: number;
  readOnly?: boolean | undefined;
  allowedActions?: string[] | undefined;
}

interface IActionFormModel extends Omit<IConfigurableActionConfiguration, 'actionOwner' | 'actionName'> {
  actionFullName: string | null;
}
