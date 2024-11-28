import { AutoComplete, Empty, Spin, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FC } from 'react';
import { useGet } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_FORMS_MODULE_NAME } from '@/shesha-constants';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import HelpTextPopover from '@/components/helpTextPopover';

export interface NotificationIdentifier {
    readonly name: string;
    readonly module?: string | null;
    readonly version?: number;
  }

export interface INotificationAutocompleteRuntimeProps {
    value?: NotificationIdentifier;
    onChange?: (value?: NotificationIdentifier) => void;
    readOnly?: boolean;
    maxResultCount?: number;
    convertToFullId?: boolean;
}

interface IOption {
    label: string | ReactNode;
    value: string;
    data: NotificationIdentifier;
    options?: IOption[];
}

const baseItemFilter = [
    {
        "==": [{ "var": "isLast" }, true]
    },
];
const getFilter = (term: string) => {
    const termFilter = term
        ? [
            {
                or: [
                    { 'in': [term, { 'var': 'name' }] },
                    { 'in': [term, { 'var': 'module.name' }] },
                ]
            },
        ]
        : [];
    const filter = {
        and: [...baseItemFilter, ...termFilter]
    };
    return JSON.stringify(filter);
};
const NOTIFICATION_CONFIG_ENTITY_TYPE = 'Shesha.Domain.NotificationTypeConfig';
const NOTIFICATION_CONFIG_PROPERTIES = 'id name module { id name } label description versionNo';

const getListFetcherQueryParams = (term: string, maxResultCount): IGenericGetAllPayload => {
    return {
        skipCount: 0,
        maxResultCount: maxResultCount ?? 10,
        entityType: NOTIFICATION_CONFIG_ENTITY_TYPE,
        properties: NOTIFICATION_CONFIG_PROPERTIES,
        quickSearch: null,
        filter: getFilter(term),
        sorting: 'module.name, name',
    };
};
const getSelectedValueQueryParams = (value?: NotificationIdentifier): IGenericGetAllPayload => {
    if (!value)
        return null;

    const expression = {
        and: [
            ...baseItemFilter,
            { '==': [{ 'var': 'name' }, value.name] },
            { '==': [{ 'var': 'module.name' }, value.module] },
        ]
    };

    return expression
        ? {
            skipCount: 0,
            maxResultCount: 1000,
            entityType: NOTIFICATION_CONFIG_ENTITY_TYPE,
            properties: NOTIFICATION_CONFIG_PROPERTIES,
            filter: JSON.stringify(expression),
        }
        : null;
};

interface IResponseItem {
    id: string;
    name: string;
    label?: string;
    description?: string;
    versionNo?: number;
    module?: {
        id: string;
        name: string;
    };
}

interface IConfigurationItemProps {
    name: string;
    label?: string;
    description?: string;
    versionNo?: number;
}

const NotificationLabel: FC<IConfigurationItemProps> = ({ name, description, versionNo, label }) => {
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
};

const getFormValue = (item: IResponseItem) => {
    return item.module
        ? `${item.module.name}:${item.name}`
        : item.name;
};

const getDisplayText = (item: IResponseItem) => {
    return item
        ? item.module
            ? `${item.module.name}: ${item.name}`
            : item.name
        : null;
};

export const NotificationAutocomplete: FC<INotificationAutocompleteRuntimeProps> = (props) => {
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
                console.error(items.length > 1 ? "Found more than one notification with specified name" : "Notification not found");
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

        if (!props.value){
            if (autocompleteText)
                setAutocompleteText(null);
            selectedValue.current = props.value;
        }
    }, [props.value]);

    const options = useMemo<IOption[]>(() => {
        const result: IOption[] = [];
        if (fetchedItems) {
            fetchedItems.forEach(item => {
                const moduleDto = item.module ?? { name: LEGACY_FORMS_MODULE_NAME, id: '-' };

                const opt: IOption = {
                    label: (
                        <NotificationLabel
                            name={item.name}
                            label={item.label}
                            description={item.description}
                            versionNo={item.versionNo}
                        />
                    ),
                    value: getFormValue(item),
                    data: {
                        name: item.name,
                        module: item.module?.name,
                    }
                };
                let group = result.find(g => g.value === moduleDto.id);
                if (!group) {
                    group = {
                        label: moduleDto.name,
                        value: moduleDto.id,
                        data: null,
                        options: [opt],
                    };
                    result.push(group);
                } else
                    group.options.push(opt);

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
    };

    const onSelect = (_value, option) => {
        const notificationId = (option as IOption)?.data;
        selectedValue.current = notificationId;
        if (props.onChange) {
            props.onChange(notificationId);
        }
    };

    const onClear = () => {
        selectedValue.current = null;
        if (props.onChange) {
            props.onChange(null);
        }
    };

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
};