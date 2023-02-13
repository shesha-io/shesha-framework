// import { useAuth, useAuthorizationSettings, useGlobalState, usePublish } from '@shesha/reactjs';
import React, { FC, useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import { useGlobalState } from '../../providers';

export interface ICurrencyConverterProps {
    /**
     * The base currency to convert from
     */
    from: string;

    /**
     * The output currency to convert to
     */
    to: string;

    /**
     * The exhange rate
     */
    rate: number;
}

const CurrencyConverter: FC<ICurrencyConverterProps> = ({
    from = 'USD',
    to = 'ZAR',
    rate = 15
}) => {

    const [uAmount, setAmount] = useState(0);
    const [uExchange, setExchange] = useState(0);

    const ECHANGE_GLOBAL_KEY = "EchangeGlobalKey";

    const {
        setState: setGlobalState,
        getStateByKey: getGlobalStateByKey,
        clearState: clearGlobalState
    } = useGlobalState();

    useEffect(() => {
        onConvert();
    }, [uExchange]);

    const onConvert = () => {
        setExchange(uAmount * rate);
        setGlobalState({ key: ECHANGE_GLOBAL_KEY, data: uExchange });
        message.info(uExchange);
    };

    const onChange = (e) => {
        setAmount(e.target.value);
    };

    const onCheckCache = () => {
        const state = getGlobalStateByKey(ECHANGE_GLOBAL_KEY);
        message.info(state);
    };

    const onClearCache = () => {
        clearGlobalState(ECHANGE_GLOBAL_KEY);
        message.info("Deleted Cache");
    };

    return (
        <div>
            <Input style={{ width: '80px' }} onChange={onChange} />
            <Button onClick={onConvert}>Convert {uAmount} {from} to {to}</Button>
            <Button onClick={onCheckCache} type="primary">View Cache</Button>
            <Button onClick={onClearCache} type="link">Clear Cache</Button>
        </div>
    );
};

export default CurrencyConverter;