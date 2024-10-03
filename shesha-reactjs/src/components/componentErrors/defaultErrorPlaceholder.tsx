import { IConfigurableFormComponent, IToolboxComponent } from '@/index';
import { IModelValidation } from '@/utils/errors';
import { Form } from 'antd';
import React from 'react';

const getDefaultErrorPlaceholder = (errors: IModelValidation, toolboxComponent?: IToolboxComponent<IConfigurableFormComponent>) => {
  if (Boolean(toolboxComponent?.icon))
    return <div style={{textAlign: 'center', color: 'silver',fontSize: '20px'}}>{toolboxComponent.icon}</div>;

  const label = errors?.model?.componentName || errors.componentName;
  return Boolean(label)
    ? <Form.Item label={errors?.model?.componentName || errors.componentName}>
      <div className='wrapper' style={{ minHeight: '28px', display: 'block', width: '100%' }}/>
    </Form.Item>
    : <div className='wrapper' style={{ minHeight: '28px', display: 'block', width: '100%' }}/>;
};

export default getDefaultErrorPlaceholder;