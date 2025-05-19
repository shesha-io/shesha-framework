import React, { FC } from 'react';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemSetting } from './configurableFormItemSetting';
import { ConfigurableFormItemLive } from './configurableFormItemLive';

const ConfigurableFormItem: FC<IConfigurableFormItemProps> = (props) => {
  return props.model.jsSetting
    ? <ConfigurableFormItemSetting {...props} />
    : <ConfigurableFormItemLive {...props} />;
};


export default React.memo(ConfigurableFormItem);