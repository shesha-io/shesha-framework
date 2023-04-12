import { Alert } from 'antd';
import React, { FC } from 'react';

interface IErrorMessage {
    maxPoints: number;
    maxReached?: boolean;
    isReadonly: boolean;
    width?: number;
}

const WarningMessage: FC<IErrorMessage> = ({ maxReached, maxPoints, isReadonly, width }) => {

    return (
        <>
            {(!isReadonly && maxReached) ?
                <Alert message={`Maximum of ${maxPoints} points has been recorded`} banner closable style={{ width }} />
                : null
            }
        </>
    );
};

export default WarningMessage;
