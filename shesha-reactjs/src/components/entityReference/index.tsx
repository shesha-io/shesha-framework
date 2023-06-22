import { Button, message, notification, Spin } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { FormIdentifier, ShaLink, useConfigurableActionDispatcher, useForm, useGlobalState, useSheshaApplication, ValidationErrors } from "../..";
import { entitiesGet } from 'apis/entities';
import { IConfigurableActionConfiguration } from '../../interfaces/configurableAction';
import { IKeyValue } from '../../interfaces/keyValue';
import { useConfigurationItemsLoader } from '../../providers/configurationItemsLoader';
import { get, axiosHttp } from '../../utils/fetchers';
import { GenericQuickView } from '../quickView';

export type EntityReferenceTypes = 'NavigateLink' | 'Quickview' | 'Dialog';

export interface IEntityReferenceProps {
    // common properties
    entityReferenceType: EntityReferenceTypes;
    value?: any;
    disabled?: boolean;
    placeholder?: string;
    entityType?: string;
    formSelectionMode: 'name' | 'dynamic';

    /** The Url that details of the entity are retreived */
    getEntityUrl?: string;
    /** The property froom the data to use as the label and title for the popover */
    displayProperty: string;
    /** From identifier for navigate/dialog/quickview  */
    formIdentifier?: FormIdentifier;
    /** View type for navigate/dialog/quickview  */
    formType?: string;

    // Quickview properties
    quickviewWidth?: number;

    // Dialog properties
    modalTitle?: string;
    showModalFooter?: boolean;
    additionalProperties?: IKeyValue[];
    modalWidth?: number | string;
    customWidth?: number;
    widthUnits?: '%' | 'px';
    /**
     * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
     * This is useful in cases whereby one form is used both for create and edit mode
     */
    skipFetchData?: boolean;
    /** What http verb to use when submitting the form. Used in conjunction with `showModalFooter` */
    submitHttpVerb?: 'POST' | 'PUT';

    // Dialog action properties
    handleSuccess: boolean;
    onSuccess?: IConfigurableActionConfiguration;
    handleFail: boolean;
    onFail?: IConfigurableActionConfiguration;
}

export const EntityReference: FC<IEntityReferenceProps> = (props) => {

    const { executeAction } = useConfigurableActionDispatcher();
    const { globalState } = useGlobalState();

    const useFormLocal = useForm(false);
    // fix for storybook
    const form = useFormLocal?.form;
    const formData = useFormLocal?.formData;
    const formMode = useFormLocal?.formMode;

    const { getEntityFormId } = useConfigurationItemsLoader();
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const [ formIdentifier, setFormIdentifier ] = useState<FormIdentifier>(props.formSelectionMode === 'name' ? props.formIdentifier : null);
    const [ fetched, setFetched ] = useState(false);
    const [ displayText, setDisplayText ] = useState((!props.value ? props.placeholder : props.value._displayName) ?? '');

    const entityId = props.value?.id ?? props.value;
    const entityType = props.entityType ?? props.value?._className;
    const formType = props.formType ?? (props.entityReferenceType === 'Quickview' ? 'quickview' : 'details');

    useEffect(() => {
        if (!Boolean(formIdentifier) && props.formSelectionMode === 'dynamic' && Boolean(entityType) && Boolean(formType) && props.entityReferenceType !== 'Quickview') {
            getEntityFormId(entityType, formType, (formid) => {
                setFormIdentifier({name: formid.name, module: formid.module});
            });
        }
    }, [formIdentifier, entityType, formType]);

    useEffect(() => {
        // fetch data only for NavigateLink and Dialog mode. Quickview will fetch data later
        if (!fetched && props.entityReferenceType !== 'Quickview' && entityId) {
            //
            const queryParams = { id: entityId, properties: `id ${Boolean(props.displayProperty) ? props.displayProperty : ''}` };
            const fetcher = props.getEntityUrl 
                ? get(props.getEntityUrl, queryParams, { base: backendUrl, headers: httpHeaders})
                : entitiesGet({...queryParams, entityType: entityType }, { base: backendUrl, headers: httpHeaders} );
            
            fetcher.then(resp => { 
                    setDisplayText(resp.result[props.displayProperty] ?? displayText);
                    setFetched(true);
                })
                .catch(reason => {
                     notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> }); 
                });
        }
    }, [fetched, entityId, props.entityReferenceType, props.getEntityUrl, entityType]);

    /* Dialog */

    const dialogExecute = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked

        const actionConfiguration: IConfigurableActionConfiguration = {
            actionName: 'Show Dialog',
            actionOwner: 'shesha.common',
            handleSuccess: props.handleSuccess,
            handleFail: props.handleFail,
            onFail: props.onFail,
            onSuccess: props.onSuccess,
            actionArguments: {
                formId: formIdentifier,
                modalTitle: props.modalTitle,
                showModalFooter: props.showModalFooter ?? true,
                additionalProperties: Boolean(props.additionalProperties) && props.additionalProperties?.length > 0
                    ? props.additionalProperties
                    : [{key: 'id', value: '{{entityReference.id}}'}],
                modalWidth: props.modalWidth,
                customWidth: props.customWidth,
                widthUnits: props.widthUnits,
                skipFetchData: props.skipFetchData ?? false,
                submitHttpVerb: props.submitHttpVerb ?? 'PUT'
            }
        };

        const evaluationContext = {
            entityReference: {id: entityId, entity: props.value},
            data: formData,
            moment: moment,
            form: form,
            formMode: formMode,
            http: axiosHttp(backendUrl),
            message: message,
            globalState: globalState,
        };
        
        executeAction({
            actionConfiguration: actionConfiguration,
            argumentsEvaluationContext: evaluationContext,
        });
    };

    const content = useMemo(() => {
        console.log(props.formSelectionMode);
        console.log('formIdentifier: ', formIdentifier);
        console.log('displayText: ', displayText);
        console.log('entityId: ', entityId);
        return !(props.entityReferenceType === 'Quickview') && !(formIdentifier && displayText && entityId)
        ? <Button type="link"><span><Spin size="small" /> Loading...</span></Button>
        : props.disabled
            ? <Button disabled type="link">{displayText}</Button>
            : props.entityReferenceType === 'NavigateLink'
                ? <ShaLink linkToForm={formIdentifier} params={{id: entityId}}>{displayText}</ShaLink>
                : props.entityReferenceType === 'Quickview'
                    ? <GenericQuickView
                        displayProperty={props.displayProperty}
                        displayName={displayText}
                        entityId={props.value?.id ?? props.value}
                        className={entityType}
                        getEntityUrl={props.getEntityUrl}
                        width={props.quickviewWidth}
                        formIdentifier={formIdentifier}
                        formType={formType}
                    />
                    : <Button type="link" onClick={dialogExecute}>{displayText}</Button>;
    }, [formIdentifier, displayText, entityId]);

    if (props.formSelectionMode === 'name' && !Boolean(formIdentifier))
        return <Button type="link" disabled>Form identifier is not configured</Button>;
    
    if (!props.value)
        return <Button type="link" disabled>{displayText}</Button>;

    return content;
};