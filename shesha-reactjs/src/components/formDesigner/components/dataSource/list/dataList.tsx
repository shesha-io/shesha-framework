import { Checkbox, Divider } from "antd";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React, { FC, useEffect, useMemo, useState } from "react";
import { useMeasure, usePrevious } from "react-use";
import { FormFullName, FormIdentifier, IFormDto, useAppConfigurator, useSheshaApplication } from "../../../../../providers";
import { useConfigurationItemsLoader } from "../../../../../providers/configurationItemsLoader";
import { getFormConfiguration, getMarkupFromResponse, useFormConfiguration } from "../../../../../providers/form/api";
import { IPersistedFormProps } from "../../../../../providers/formPersisterProvider/models";
import ConditionalWrap from "../../../../conditionalWrapper";
import ConfigurableForm from "../../../../configurableForm";
import FormInfo from "../../../../configurableForm/formInfo";
import ShaSpin from "../../../../shaSpin";
import Show from "../../../../show";
import { IDataListProps } from "./models";

interface EntityForm {
    entityType: string;
    isFetchingFormId: boolean;
    formId: FormFullName;
    isFetchingFormConfiguration: boolean;
    formConfiguration: IFormDto;
}

export const DataList: FC<Partial<IDataListProps>> = ({
    formId,
    formType,
    formSelectionMode,
    selectionMode,
    selectedRow,
    selectedRows,
    onSelectRow,
    onMultiSelectRows,
    onSelectedIdsChanged,
    records,
    isFetchingTableData,
    entityType,
    selectedIds,
    changeSelectedIds,
    ...props
}) => {
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const [ formConfigs, setFormConfigs ] = useState<IFormDto[]>([]);
    const [ entityForms, setEntityForms ] = useState<EntityForm[]>([]);

    useEffect(() => {
        setEntityForms([]);
    }, [formSelectionMode, formId, formType])

    const onSelectRowLocal = (index: number, row: any) => {
        if (selectionMode === 'none') return;

        if (selectionMode === 'multiple') {
            let selected = [...selectedIds];
            if (selectedIds.find(x => x == row?.id))
                selected = selected.filter(x => x != row?.id)
            else
                selected = [...selected, row?.id];
            changeSelectedIds(selected)
            onMultiSelectRows(records?.map((item: any, index) => { return { isSelected: Boolean(selected.find(x => x == item?.id)), index, id: item?.id, original: item }; }));
        } else {
            if (onSelectRow)
                onSelectRow(index, row);
        }
    };

    const onSelectAllRowsLocal = (val: Boolean) => {
        changeSelectedIds(val ? records?.map((item: any) => { return item?.id; }) : []);
        onMultiSelectRows(records?.map((item: any, index) => { return { isSelected: val, index, id: item?.id, original: item }; }));
    };

    const previousIds = usePrevious(selectedIds);

    useEffect(() => {
    if (!(previousIds?.length === 0 && selectedIds?.length === 0) && typeof onSelectedIdsChanged === 'function') {
        onSelectedIdsChanged(selectedIds);
    }
    }, [selectedIds]);

    useEffect(() => {
        if (!isFetchingTableData && records?.length && props.onFetchDataSuccess)
            props.onFetchDataSuccess();
    }, [isFetchingTableData]);

    const { getEntityFormId } = useConfigurationItemsLoader();
    const [ formIdentifier, setFormIdentifier ] = useState<FormIdentifier>(formId); //props.formSelectionMode == 'name' ? formId : null);

    useEffect(() => {
        if (formSelectionMode == 'view' && Boolean(entityType) && Boolean(formType) ) {
            getEntityFormId(entityType, formType, (formid) => {
                setFormIdentifier({name: formid.name, module: formid.module})
            });
        }
    }, [formSelectionMode, entityType, formType]);

    const { formConfiguration, loading: isFetchingFormConfig, refetch: refetchFormConfig/*, error: fetchFormError*/ } = useFormConfiguration({
        formId: formIdentifier,
        lazy: true,
    });
    
    useEffect(() => {
        if (formSelectionMode == 'name' && Boolean(formIdentifier))
            refetchFormConfig();
    }, [formIdentifier])

    const getFormIdFromExpression = (item): IFormDto => {
        return null;
    };

    const renderSubForm = (item?: any) => {
        let values: { [key: string]: any, id: string } = {...item};

        let formConfig = formConfiguration;

        if (!Boolean(formConfig)) {
            if (formSelectionMode == 'view') {
                const className = entityType ?? item?._className;
                if (Boolean(className)) {
                    const entityForm = entityForms.find(x => x.entityType == className);
                    if (Boolean(entityForm)) {
                        if (entityForm.isFetchingFormConfiguration || entityForm.isFetchingFormId) {
                            return null;
                        } else if (Boolean(entityForm.formConfiguration)) {
                            formConfig = entityForm.formConfiguration;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null
                }
            }
            if (formSelectionMode == 'expression') {
                const formId = getFormIdFromExpression(item);
                formConfig = formConfigs.find(x => {
                    return x.name == formId.name && x.module == formId.module && (!formId.versionNo || x.versionNo == formId.versionNo);
                })
                if (!Boolean(formConfigs)) {
                    return null;
                }
            }
        }

        return (
            <ConfigurableForm
                key={nanoid()}
                mode="readonly"
                //labelCol={{span: 3}}
                //wrapperCol={{span: 17}} 
                markup={{ components: formConfig?.markup, formSettings: formConfig?.settings }}
                initialValues={values} 
                skipFetchData={true}
                //onValuesChange={(value, index) => { alert(JSON.stringify(value) + " : " + JSON.stringify(index))}}
            />
        );
    };

    const { formInfoBlockVisible } = useAppConfigurator();
    const showFormInfo = Boolean(formConfiguration) && formInfoBlockVisible;
    const persistedFormProps: IPersistedFormProps = { 
        id: formConfiguration?.id,
        module: formConfiguration?.module,
        versionNo: formConfiguration?.versionNo,
        description: formConfiguration?.description,
        versionStatus: formConfiguration?.versionStatus,
        name: formConfiguration?.name
    };

    const [ref, measured] = useMeasure();
    
    const listItemWidth = 1;

    const itemWidth = useMemo(() => {
        if (!measured) return 0;
        //ensures that vertical landscape is always 100% of measured width
        if (!listItemWidth /*|| orientation === 'vertical'*/) {
          return measured?.width;
        }
    
        /*if (listItemWidth === 'custom') {
          if (!customListItemWidth) return measured?.width;
          else return customListItemWidth;
        }*/
    
        return measured?.width * listItemWidth;
    }, [measured?.width, listItemWidth/*, customListItemWidth, orientation*/]);

    const entityTypes = useMemo(() => {
        if (Boolean(entityType))
            return [entityType];
        const et = [];
        records.forEach(x => {
            if (Boolean((x as any)?._className) && !Boolean(entityTypes.find(et => et == (x as any)?._className))) {
                entityTypes.push((x as any)?._className);
            }
        });
        return et;
    }, [records, entityType]);

    if (formSelectionMode == 'view' && records?.length > 0) {
        entityTypes.forEach(etype => {
            if (Boolean(etype)) {
                const entityForm = entityForms.find(x => x.entityType == etype);
                if (Boolean(entityForm)) {
                    if (entityForm.isFetchingFormConfiguration || entityForm.isFetchingFormId) {
                        return null;
                    } else if (Boolean(entityForm.formConfiguration)) {
                        return;
                        //const formConfig = entityForm.formConfiguration;
                    } else if (Boolean(entityForm.formId)) {
                        entityForm.formConfiguration = formConfigs.find(x => x.name == entityForm.formId.name && x.module == entityForm.formId.module);
                        if (!Boolean(entityForm.formConfiguration)) {
                        }
                    } else {
                        getEntityFormId(etype, formType, (formid) => {
                            entityForm.formId = formid;
                            entityForm.isFetchingFormId = false;
                            entityForm.formConfiguration = formConfigs.find(x => x.name == formid.name && x.module == formid.module);
                            if (!Boolean(entityForm.formConfiguration)) {
                                entityForm.isFetchingFormConfiguration = true;
                                getFormConfiguration(entityForm.formId, backendUrl, httpHeaders)
                                    .then(response => {
                                        const markupWithSettings = getMarkupFromResponse(response);
                                        const formConf = {
                                            ...response.result,
                                            markup: markupWithSettings?.components,
                                            settings: markupWithSettings?.formSettings
                                        };
                                        setFormConfigs(prev => [...prev, formConf]);
                                        entityForm.isFetchingFormConfiguration = false;
                                        entityForm.formConfiguration = formConf;
                                        setEntityForms(prev => prev.map(x => {
                                            if (x.entityType == entityForm.entityType) 
                                                return entityForm;
                                            return x; 
                                        }));
                                    });
                            }
                            setEntityForms(prev => prev.map(x => {
                                if (x.entityType == entityForm.entityType) 
                                    return entityForm;
                                return x; 
                            }));
                        });
                        setEntityForms(prev => prev.map(x => { return {...x, isFetchingFormId: x.entityType == etype ? true : x.isFetchingFormId} }));
                        return null;
                    }
                } else {
                    const entityForm: EntityForm = {
                        entityType: etype, 
                        formId: undefined,
                        isFetchingFormId: false,
                        isFetchingFormConfiguration: false,
                        formConfiguration: undefined
                    };
                    setEntityForms(prev => [...prev, entityForm ]);
                    return null;
                }
            } else {
                return null;
            }
        });
    }

    return (
        <>
            <Show when={showFormInfo}>
                <FormInfo {...persistedFormProps} />
            </Show>
            <Show when={selectionMode === 'multiple'}>
                <Checkbox
                    onChange={(e) => { onSelectAllRowsLocal(e.target.checked)}}
                    checked={selectedRows?.length === records?.length && records?.length > 0}
                    indeterminate={selectedRows?.length !== records?.length && selectedRows?.length > 0}
                >
                    Select All
                </Checkbox>
                <Divider/>
            </Show>
            <ShaSpin spinning={isFetchingTableData || isFetchingFormConfig} tip={isFetchingTableData ? 'Loading...' : 'Submitting...'}>
                <div
                    ref={ref}
                    className={classNames('sha-list-component-body', {
                        loading: (isFetchingTableData || isFetchingFormConfig) && records?.length === 0,
                        //horizontal: orientation === 'horizontal',
                    })}
                >
                    <Show when={Boolean(records) /*&& Boolean(formConfiguration?.markup)*/}>
                        {records?.map((item: any, index) => {
                            const isLastItem = records?.length - 1 == index;
                            const selected = selectedRow?.index == index || selectedRows?.length > 0 && selectedRows?.some(({id}) => id === item?.id);
                            return (
                                <div key={item['id']} >
                                    <ConditionalWrap
                                        key={index}
                                        condition={selectionMode !== 'none'}
                                        wrap={children => (
                                            <Checkbox
                                                className={classNames('sha-list-component-item-checkbox', { selected })}
                                                checked={selected}
                                                onChange={() => {
                                                    onSelectRowLocal(index, item);
                                                }}
                                            >
                                                {children}
                                            </Checkbox>
                                        )}
                                    >
                                        <div
                                            className={classNames('sha-list-component-item', { selected })}
                                            onClick={() => { onSelectRowLocal(index, item); }}
                                            style={{ width: selectionMode === 'none' ? itemWidth : !isNaN(itemWidth) ? itemWidth - 28 : itemWidth }}
                                        >
                                            {renderSubForm(item)}
                                        </div>
                                        {!isLastItem && <Divider className="sha-list-component-divider" />}
                                    </ConditionalWrap>
                                </div>
                            );
                        })}
                    </Show>
                </div>
            </ShaSpin>
        </>
    );
};