import React, { FC, useMemo, useRef } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { SettingOutlined } from '@ant-design/icons';
import { FormProvider, IConfigurableFormComponent } from '@/providers';
import { ConfigurableFormItem } from '@/components';
import { getSettings } from './settings';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { Form } from 'antd';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { componentsTreeToFlatStructure, DEFAULT_FORM_SETTINGS, useDeepCompareMemo, useForm } from '@/index';
import { defaultFormProps } from '@/components/configurableForm/formDefaults';
import SettingsControl from './settingsControl';
import { getValueByPropertyName, setValueByPropertyName } from '@/utils/object';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
    components?: IConfigurableFormComponent[];
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
    type: 'setting',
    isInput: true,
    isOutput: true,
    name: 'Setting',
    isHidden: true,
    icon: <SettingOutlined />,
    Factory: ({ model }) => {

        const [ internalForm ] = Form.useForm();

        const components: IConfigurableFormComponent[] = useDeepCompareMemo(() => {
            return model?.components?.map(c => ({ 
                ...c, 
                hideLabel: true, 
                readOnly: model?.readOnly, 
                editMode: model.editMode,
                hidden: model.hidden
            }));
        }, [model?.components, model?.readOnly, model?.id]);

        const designerComponents = useFormDesignerComponents();
        const flatStructure = useMemo(() => componentsTreeToFlatStructure(designerComponents, components), []);
      
        const props = useMemo(() => {
            const internalProps = 
                Boolean(model?.label) || !(model?.components?.length > 0)
                ? model
                : model?.components[0];
            return {...internalProps};
        }, [model?.label, model?.components?.length]);

        if (model.hidden) return null;

        return (
            <ConfigurableFormItem model={props} className='sha-js-label' >
                {(value, onChange) => (
                    <>
                    {/*<FormProvider
                        form={internalForm}
                        name={''}
                        allComponents={flatStructure.allComponents}
                        componentRelations={flatStructure.componentRelations}
                        formSettings={DEFAULT_FORM_SETTINGS}
                        mode={props.readOnly ? 'readonly' : 'edit'}
                        isActionsOwner={false}
                >*/}

                        <SettingsControl
                            propertyName={model.propertyName} 
                            mode={'value'} 
                            onChange={onChange}
                            value={value}
                        >
                            {(_valueValue, _onChangeValue, propertyName) => {
                                return (
                                    <>
                                    {/*<Form
                                        {...defaultFormProps}
                                        key={props.readOnly?.toString()}
                                        component={false} 
                                        form={internalForm} 
                                        initialValues={setValueByPropertyName({}, props.propertyName, valueValue, true)}
                                        onValuesChange={(val) => {
                                            onChangeValue(!!val ? getValueByPropertyName(val, props.propertyName) : val)
                                        }} 
                                    >*/}
                                        <SettingsControlRenderer 
                                            id={props.id}
                                            components={components}
                                            propertyName={propertyName}
                                        />
                                    {/*</Form>*/}
                                    </>
                                );
                            }}
                        </SettingsControl>
                    {/*</FormProvider>*/}
                    </>
                )}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
    migrator: (m) => m
        .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev))
  ,    
};

interface SettingsControlRendererProps {
    id: string,
    components: IConfigurableFormComponent[],
    propertyName: string;
}

const SettingsControlRenderer: FC<SettingsControlRendererProps> = (props) => {

  /*const components = useMemo(() => {
    console.log('SettingsControlRenderer.inner', props.propertyName );
    return props.components?.map(c => ({ ...c, propertyName: props.propertyName }));
  }, [props.propertyName]);

  return (
    <ComponentsContainer 
      key={props.propertyName}
      containerId={props.propertyName}
      dynamicComponents={props.components} 
    />
  );*/

  const model = {...props.components[0], propertyName: props.propertyName};

  const form = useForm();
  const componentRef = useRef();
  const toolboxComponent = form.getToolboxComponent(model.type);

  if (!toolboxComponent) return null;

    return (
        <toolboxComponent.Factory key={model.propertyName} model={model} componentRef={componentRef} form={form.form}/>
    );
}

export default SettingsComponent;
