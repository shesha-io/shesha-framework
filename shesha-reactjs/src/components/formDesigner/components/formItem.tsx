import React, { FC } from 'react';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemSetting } from './configurableFormItemSetting';
import { ConfigurableFormItemLive } from './configurableFormItemLive';

const ConfigurableFormItemInner: FC<IConfigurableFormItemProps> = (props) => {
  return props.model.jsSetting
    ? <ConfigurableFormItemSetting {...props} lazy={props.model.jsSetting === 'lazy'} />
    : <ConfigurableFormItemLive {...props} />;
};

export const ConfigurableFormItem = React.memo(ConfigurableFormItemInner);
