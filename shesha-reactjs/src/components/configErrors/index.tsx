import { WarningFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { FC } from 'react';

interface IConfigErrorProps {
  type: string;
  errors: string[];
}
const ConfigError: FC<IConfigErrorProps> = ({ errors, type }) => {

  const errortip = (type, errors) => (
    <div>
      <div>
        <strong>'{type}' has configuration issue(s)</strong>
      </div>
      <ul>
        {errors.map((error) => <li>{error}</li>)}
      </ul>
    </div>
  );

  return (
    <div
      style={{
        border: '1px solid #F2AC57',
        borderRadius: '5px',
        backgroundColor: '#FCEEDD',
        height: '48px',
        paddingLeft: '16px',
        lineHeight: '48px'
      }}
    >
      <Tooltip title={errortip(type, errors)} color='#F2AC57' >
        <span style={{}}><WarningFilled style={{ color: '#F2AC57', cursor: 'pointer', fontSize: '18px' }} />  </span>
      </Tooltip>
      <span style={{ color: '#F2AC57'}}><strong>'{type}' has configuration issue(s)</strong></span>
    </div>
  );
};

export default ConfigError;