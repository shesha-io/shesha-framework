import { ConfigurableForm } from '@/components/configurableForm';
import modelSettingsMarkup from '../modelSettings.json';
import React, { FC, useMemo, useRef } from 'react';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { FormMarkup } from '@/providers/form/models';
import { Alert, App, Skeleton } from 'antd';
import { PermissionEditorComponent } from '../permissionEditor';
import { PropertiesEditorComponent } from '../propertiesEditor';
import { useModelConfigurator } from '@/providers';
import { ViewsEditorComponent } from '../viewsEditor';
import { useStyles } from '../styles/styles';
import { cloneDeep, filter, isEqual, keys, union } from 'lodash';
import { isDefined } from '@/utils/nullables';
import { IPropertyErrors } from '@/providers/modelConfigurator/contexts';
import { ModelConfigurationDto } from '@/apis/modelConfigurations';

const markup = modelSettingsMarkup as FormMarkup;

export const ModelConfiguratorRenderer: FC = () => {
  const { styles } = useStyles({ height: 180 });
  const { message } = App.useApp();
  const { showErrors, errors, modelConfiguration, initialConfiguration, getForm, saveForm, setModified, validateModel } = useModelConfigurator();

  const initialModel = useRef(cloneDeep(initialConfiguration));
  if (initialModel.current === undefined) initialModel.current = cloneDeep(initialConfiguration);

  const errorsText = useMemo((): React.ReactNode => {
    return (
      <>
        <div>Please check the following errors:</div>
        <ul>
          {errors?.map((e: IPropertyErrors | string, i1) => {
            if (typeof e === 'string') return <li key={i1}>{e}</li>;
            return (
              <>
                <li key={i1}>{e.propertyName}</li>
                {
                  e.errors && e.errors.length > 0 && (
                    <ul>
                      {e.errors.map((error, i2) => <li key={i2}>{error}</li>)}
                    </ul>
                  )
                }
              </>
            );
          })}
        </ul>
      </>
    );
  }, [errors]);

  const onSettingsSave = (): void => {
    saveForm()
      .then(() => message.success('Model saved successfully'))
      .catch(() => message.error('Failed to save model'));
  };

  // get list of changed keys
  const changedKeys = (o1, o2, name?: string): string[] => {
    // Get all keys
    const allKeys = union(keys(o1), keys(o2));
    // Get keys that are not equal
    const filtered = filter(allKeys, function (key) {
      return (isDefined(o1) && !isDefined(o2)) ||
        (!isDefined(o1) && isDefined(o2)) ||
        (isDefined(o1) && isDefined(o2) && !isEqual(o1[key], o2[key]));
    });

    let newChanged: string[] = [];
    // Return only latest keys
    for (const key of filtered) {
      if (isDefined(o1) && isDefined(o2) && ((typeof o1[key] === 'object' && o1[key] !== null) || (typeof o2[key] === 'object' && o2[key] !== null)))
        newChanged = newChanged.concat(changedKeys(o1[key], o2[key], name ? name + '.' + key : key));
      // Exclude some framework keys
      else if (['chosen', 'selected', 'dependency'].indexOf(key) === -1)
        newChanged.push(name ? name + '.' + key : key);
    }
    return newChanged;
  };

  const onValuesChange = (_changedValues: unknown, values: ModelConfigurationDto): void => {
    const keys = changedKeys(modelConfiguration, values);
    // Modified if there are changed keys
    const modified = keys.length > 0;
    setModified(modified);
    validateModel(values);
  };

  if (initialModel.current === undefined)
    return <Skeleton active />;

  return (
    <div className={styles.shaModelConfigurator}>
      <CustomErrorBoundary>
        {showErrors && errors?.length > 0 && <Alert type="error" title={errorsText} showIcon />}
        <ConfigurableForm
          className={styles.shaModelConfiguratorForm}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          mode="edit"
          markup={markup}
          onValuesChange={onValuesChange}
          onFinish={onSettingsSave}
          form={getForm()}
          // eslint-disable-next-line react-hooks/refs
          initialValues={initialModel.current}
          sections={{
            properties: () => <PropertiesEditorComponent />,
            permission: () => <PermissionEditorComponent name="permission" />,
            permissionGet: () => <PermissionEditorComponent name="permissionGet" />,
            permissionCreate: () => <PermissionEditorComponent name="permissionCreate" />,
            permissionUpdate: () => <PermissionEditorComponent name="permissionUpdate" />,
            permissionDelete: () => <PermissionEditorComponent name="permissionDelete" />,
            viewConfigurations: () => <ViewsEditorComponent />,
          }}
        />
      </CustomErrorBoundary>
    </div>
  );
};

export default ModelConfiguratorRenderer;
