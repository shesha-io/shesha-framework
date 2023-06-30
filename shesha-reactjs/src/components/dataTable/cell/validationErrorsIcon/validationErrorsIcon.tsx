import { WarningTwoTone } from '@ant-design/icons';
import { Popover } from 'antd';
import { IErrorInfo } from 'interfaces/errorInfo';
import React from 'react';
import { FC } from 'react';

export interface IValidationErrorsIconProps {
    error?: IErrorInfo;
}

export const ValidationErrorsIcon: FC<IValidationErrorsIconProps> = ({ error }) => {
    if (!error)
        return null;
    
    const { message, details } = error;
    return (
        <Popover
            title={message}
            content={
                <>{details}</>
            }            
            trigger="hover"
            placement="topLeft"
        >
            <WarningTwoTone twoToneColor='red'/>
        </Popover>

    );
};

export default ValidationErrorsIcon;