import React, { FC } from 'react';
import { IConfigurableFormProps } from './models';
import { FormMarkup } from '@/interfaces';
import { FormWithFlatMarkupMemo } from './formWithFlatMarkup';
import { getComponentsAndSettings } from '@/providers/form/utils';
import { Alert, Skeleton } from 'antd';
import { useFormByMarkup } from '@/providers/formManager/hooks';

export interface IFormWithRawMarkupProps extends IConfigurableFormProps {
    markup: FormMarkup;
    cacheKey?: string;
    onMarkupUpdated?: () => void;
    isSettingsForm?: boolean;
}

export const FormWithRawMarkup: FC<IFormWithRawMarkupProps> = (props) => {
    const { markup, cacheKey, isSettingsForm, ...restProps } = props;

    const { components, formSettings } = getComponentsAndSettings(markup);
    const { state, form } = useFormByMarkup({ markup: components, key: cacheKey, formSettings, isSettingsForm });

    return state === 'ready'
        ? (
            <FormWithFlatMarkupMemo
                {...restProps}
                formFlatMarkup={form.flatStructure}
                formSettings={form.settings}
                onMarkupUpdated={props.onMarkupUpdated}
            />
        )
        : state === 'loading'
            ? (
                <Skeleton loading={true} />
            )
            : state === 'error'
                ? <Alert message={state} type="error" />
                : null;
};