import React, { ReactNode } from 'react';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemSetting } from './configurableFormItemSetting';
import { ConfigurableFormItemLive } from './configurableFormItemLive';
import { UnwrapCodeEvaluators } from '@/providers';

export const ConfigurableFormItem = <TValue = unknown>(props: UnwrapCodeEvaluators<IConfigurableFormItemProps<TValue>>): ReactNode => {
  return props.model.jsSetting === true || props.model.jsSetting === 'lazy'
    ? <ConfigurableFormItemSetting<TValue> {...props} lazy={props.model.jsSetting === 'lazy'} />
    : <ConfigurableFormItemLive<TValue> {...props} />;
};
