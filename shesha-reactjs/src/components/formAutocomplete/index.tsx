import { AutoComplete, Empty, Spin, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FC } from 'react';
import { useGet } from 'restful-react';
import { useDebouncedCallback } from 'use-debounce';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_FORMS_MODULE_NAME } from '../../constants';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '../../interfaces/gql';
import { FormFullName, FormIdentifier } from '../../providers/form/models';
import { asFormFullName, asFormRawId } from '../../providers/form/utils';
import HelpTextPopover from '../helpTextPopover';

export interface IFormAutocompleteRuntimeProps {
    value?: FormIdentifier;
    onChange?: (value?: FormIdentifier) => void;
    readOnly?: boolean;
    maxResultCount?: number;
    convertToFullId: boolean;
}

interface IOption {
    label: string | ReactNode;
    value: string;
    data: FormFullName;
    options?: IOption[];
}

const baseItemFilter = [
    {
        "==": [{ "var": "configuration.isLast" }, true]
    },
    {
        "==": [{ "var": "isTemplate" }, false]
    }
];
const getFilter = (term: string) => {
    const termFilter = term
        ? [
            {
                or: [
                    { 'in': [term, { 'var': 'configuration.name' }] },
                    { 'in': [term, { 'var': 'configuration.module.name' }] },
                ]
            },
        ]
        : [];
    const filter = {
        and: [...baseItemFilter, ...termFilter]
    };
    return JSON.stringify(filter);
}
const FORM_CONFIG_ENTITY_TYPE = 'Shesha.Core.FormConfiguration';
const FORM_CONFIG_PROPERTIES = 'id configuration { name, module { id name }, label, description, versionNo }';
const getListFetcherQueryParams = (term: string, maxResultCount): IGenericGetAllPayload => {
    return {
        skipCount: 0,
        maxResultCount: maxResultCount ?? 10,
        entityType: FORM_CONFIG_ENTITY_TYPE,
        properties: FORM_CONFIG_PROPERTIES,
        quickSearch: null,
        filter: getFilter(term),
        sorting: 'configuration.module.name, configuration.name',
    };
};
const getSelectedValueQueryParams = (value?: FormIdentifier): IGenericGetAllPayload => {
    if (!value)
        return null;

    const rawId = asFormRawId(value);
    const fullName = asFormFullName(value);

    const expression = rawId
        ? { '==': [{ var: 'id' }, rawId] }
        : fullName
            ? {
                and: [
                    ...baseItemFilter,
                    { '==': [{ 'var': 'configuration.name' }, fullName.name] },
                    { '==': [{ 'var': 'configuration.module.name' }, fullName.module] },
                ]
            }
            : null;

    return expression
        ? {
            skipCount: 0,
            maxResultCount: 1000,
            entityType: FORM_CONFIG_ENTITY_TYPE,
            properties: FORM_CONFIG_PROPERTIES,
            filter: JSON.stringify(expression),
        }
        : null;
}

interface IResponseItem {
    id: string;
    configuration: {
        name: string;
        label?: string;
        description?: string;
        versionNo?: number;
        module?: {
            id: string;
            name: string;
        }
    }
}

interface IConfigurationItemProps {
    name: string;
    label?: string;
    description?: string;
    versionNo?: number;
}

const FormLabel: FC<IConfigurationItemProps> = ({ name, description, versionNo, label }) => {
    const displayLabel = label && label !== name
        ? label
        : null;
    return (
        <div>
            <HelpTextPopover content={description}>
                <span>{name}</span> {false && versionNo && <i>(version {versionNo})</i>}
            </HelpTextPopover>
            {displayLabel && (
                <><br /><Typography.Text type="secondary" ellipsis={true}>{displayLabel}</Typography.Text></>
            )}
        </div>
    );
}

const getFormValue = (item: IResponseItem) => {
    return item.configuration.module
        ? `${item.configuration.module.name}:${item.configuration.name}`
        : item.configuration.name;
}

const getDisplayText = (item: IResponseItem) => {
    return item
        ? item.configuration.module
            ? `${item.configuration.module.name}: ${item.configuration.name}`
            : item.configuration.name
        : null;
}

export const FormAutocomplete: FC<IFormAutocompleteRuntimeProps> = (props) => {
    const selectedValue = useRef(null);
    const [autocompleteText, setAutocompleteText] = useState<string>(null);
    const {
        maxResultCount = 10,
    } = props;

    const listFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
        `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
        {
            lazy: true,
            queryParams: getListFetcherQueryParams(null, maxResultCount),
        }
    );

    const valueFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
        `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
        {
            lazy: true,
        }
    );
    useEffect(() => {
        if (valueFetcher.data?.success && valueFetcher.data.result) {
            const items = valueFetcher.data.result?.items ?? [];
            if (items.length === 1) {
                const displayText = getDisplayText(items[0]);
                setAutocompleteText(displayText);
            } else
                console.error(items.length > 1 ? "Found more than one form with specified name" : "Form not found");
        }
    }, [valueFetcher.data?.result]);

    const listItems = listFetcher.data?.result?.items;
    const valueItems = valueFetcher.data?.result?.items;

    const fetchedItems = useMemo<IResponseItem[]>(() => {
        return listItems
            ? listItems
            : valueItems;
    }, [listItems, valueItems]);

    useEffect(() => {
        // fetch data if required
        const valueFetchParams = getSelectedValueQueryParams(props.value);
        if (valueFetchParams) {
            const selectedFromList = selectedValue.current && selectedValue.current === props.value;
            if (!selectedFromList)
                valueFetcher.refetch({ queryParams: valueFetchParams });
        }
    }, [props.value]);

    const options = useMemo<IOption[]>(() => {
        const result: IOption[] = [];
        if (fetchedItems) {
            fetchedItems.forEach(item => {
                const module = item.configuration.module ?? { name: LEGACY_FORMS_MODULE_NAME, id: '-' };

                const opt: IOption = {
                    label: (
                        <FormLabel
                            name={item.configuration.name}
                            label={item.configuration.label}
                            description={item.configuration.description}
                            versionNo={item.configuration.versionNo}
                        />
                    ),
                    value: getFormValue(item),
                    data: {
                        name: item.configuration.name,
                        module: item.configuration.module?.name,
                    }
                };
                let group = result.find(g => g.value === module.id);
                if (!group) {
                    group = {
                        label: module.name,
                        value: module.id,
                        data: null,
                        options: [opt],
                    };
                    result.push(group);
                } else
                    group.options.push(opt)

            });
        }

        return result;
    }, [fetchedItems]);

    const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
        localValue => {
            listFetcher.refetch({ queryParams: getListFetcherQueryParams(localValue, maxResultCount) });
        },
        // delay in ms
        100
    );


    const onSearch = (term) => {
        debouncedFetchItems(term);
    }

    const onSelect = (_value, option) => {
        const formId = (option as IOption)?.data;
        selectedValue.current = formId;
        if (props.onChange) {
            props.onChange(formId);
        }
    }

    const onClear = () => {
        selectedValue.current = null;
        if (props.onChange) {
            props.onChange(null);
        }
    }

    const loading = listFetcher.loading;

    return (
        <AutoComplete
            allowClear
            notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
            style={{ width: '100%' }}
            options={options}
            onSearch={onSearch}
            onSelect={onSelect}
            onClear={onClear}
            placeholder={valueFetcher.loading ? 'Loading...' : 'Type to search'}
            disabled={valueFetcher.loading || props.readOnly}

            value={autocompleteText}
            onChange={setAutocompleteText}
        >
        </AutoComplete>
    );
}

export default FormAutocomplete;