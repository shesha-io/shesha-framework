import { WarningOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { FC, useEffect } from 'react';

interface IConfigErrorProps {
    type: string;
    errorMessage: string;
    comoponentId: string;
}
const ConfigError: FC<IConfigErrorProps> = ({ errorMessage, type, comoponentId }) => {

    useEffect(() => {
        const componentDoc = document.getElementById(comoponentId);
        if (componentDoc) {
            componentDoc.style.border = '1px solid red';
            componentDoc.style.borderRadius = '5px';
        }
        return () => {
            componentDoc.style.border = 'unset';
            componentDoc.style.borderRadius = 'unset';
        }
    }, []);


    const errortip = (tyepe, errorMessage) => (
        <div>
            <div>
                <strong>Type:</strong>{tyepe}
            </div>
            <div>
                <p>
                    {errorMessage}
                </p>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{
                display: 'flex',
                height: '80%',
                width: '70px',
                zIndex: 1000,
                position: 'absolute',
                top: '3px',
                right: '3px',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
            }}>
                <Tooltip title={errortip(type, errorMessage)} placement="right">
                    <Button icon={<WarningOutlined style={{ height: '80%' }} />} size="middle" danger>
                    </Button>
                </Tooltip>
            </div>
        </div>
    )
}

export default ConfigError;