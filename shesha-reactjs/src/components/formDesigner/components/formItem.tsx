import React from 'react';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemSetting } from './configurableFormItemSetting';
import { ConfigurableFormItemLive } from './configurableFormItemLive';
import { FCUnwrapped } from '@/providers';

const ConfigurableFormItemInner: FCUnwrapped<IConfigurableFormItemProps> = (props) => {
  return props.model.jsSetting
    ? <ConfigurableFormItemSetting {...props} lazy={props.model.jsSetting === 'lazy'} />
    : <ConfigurableFormItemLive {...props} />;
};

export const ConfigurableFormItem: FCUnwrapped<IConfigurableFormItemProps> = React.memo(ConfigurableFormItemInner);
