import React, { FC } from 'react';

interface IErrorMessage {
    minPoints: number;
    maxPoints?: number;
    isRequired: boolean;
    dataLength?: number;
}

const ErrorMessage: FC<IErrorMessage> = ({ minPoints, maxPoints, isRequired, dataLength }) => {
    return isRequired || dataLength ? (
        <p>
            <span>
                {minPoints && isRequired
                    ? `Enter a minimum of ${minPoints} points`
                    : dataLength == maxPoints
                        ? `Maxmum of ${maxPoints} points has been recorded`
                        : ''}
            </span>
        </p>
    ) : null;
};

export default ErrorMessage;
